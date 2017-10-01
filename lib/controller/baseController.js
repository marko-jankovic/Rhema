'use strict';

const utils = require('../utils');
const path = require('path');
const StringDecoder = require('string_decoder');

const DI = require('../di/injector');
const getController = Symbol('getController');
const getModel = Symbol('getModel');

class BaseController {
    constructor (config, interceptor, controller, model) {
        this.config = config;
        this.interceptor = interceptor;
        this[getController] = controller;
        this[getModel] = model;
    }

    getModel (modelName) {
        return this[getModel](modelName);
    }

    get model () {
        return this[getModel](this.page);
    }

    // set current handler from dispatcher
    use (methodType = 'get', controlerName) {
        // recommended action types:
        // GET method => getAction
        // POST method => storeAction
        // PUT method => updateAction
        // DELETE method => destroyAction
        const defTypes = { postAction: 'storeAction', putAction: 'updateAction', deleteAction: 'destroyAction' };
        const methodAction = `${methodType.toLowerCase()}Action`;
        const $di = new DI();

        // throw Error when app is started
        if (!this[methodAction] && !this[defTypes[methodAction]]) {
            throw new Error(`Controller "${controlerName}" doesn't have defined "${methodAction}" method!`);
        }

        // req/res/next from Express handler
        return (req, res, next) => {
            this.req = req;
            this.res = res;
            this.next = next;
            this.page = this.req.page;

            const action = this[defTypes[methodAction]] || this[methodAction];
            // const reqData = req.data.get ? req.data.get() : {};

            // Call Controller Action
            return $di.inject({
                ctx: this,
                fn: action,
                type: 'action',
                options: [this.req, this.res],
                namespace: `action.${this.page}`
            });
        };
    }

    // next wrapper
    //
    // Example:
    //
    //    error (err) {
    //        // use super to call parent error
    //        super.error(err);
    //    }
    error (err) {
        // trigger internalError middleware
        this.next(err, null);
    }

    // Send JSON response and handle errors
    json (err, viewmodel) {
        if (err) {
            // pass error to internalError middleware
            this.error(this.prepareError(err, viewmodel, true));
        } else {
            // send json response
            if (!this.req.isTimeout && !this.req.isError) {
                this.send(viewmodel, false);
            }
        }
    }

    // Execute beforeRender for modifying 'viewmodel' before res.render
    //
    // Example:
    //
    //    beforeRender (data, req, next) {
    //        // use super to call parent beforeRender
    //        super.afterRender(data, html, (err) => {
    //            model.beforeRender = true;
    //            next(err, data, req);
    //        });
    //    }
    beforeRender (data, req, next) {
        const beforeRenderHook = this.interceptor('beforeRender');
        return beforeRenderHook(data, req, next);
    }

    // Execute afterRender for modifying HTML before res.send
    //
    // Example:
    //
    //    afterRender (data, html, next) {
    //        // use super to call parent afterRender
    //        super.afterRender(data, html, (err) => {
    //            html = '<h1>Overwirte from Controller!</h1>'
    //            next(err, data, html);
    //        });
    //    }
    afterRender (data, html, next) {
        const afterRenderHook = this.interceptor('afterRender');
        return afterRenderHook(data, html, next);
    }

    // Render template and handle errors
    render (err, viewmodel, template) {
        if (err) {
            // pass error to internalError middleware
            this.error(this.prepareError(err, viewmodel, this.req.isJson()));
        } else {
            // template path
            const viewsPath = path.resolve(process.cwd(), this.req.app.get('views'));
            const templatePath = this.req.isJson() ? false : (template || `${viewsPath}/${this.req.page}`);

            // timeout flag set in requestTimeout middleware
            // means that internalError middleware has been triggered
            // and error page has been rendered
            if (!this.req.isTimeout && !this.req.isError) {
                // render template
                this.send(viewmodel, templatePath);
            }
        }
    }

    // Render template or send JSON response
    send (viewmodel, template) {
        // someone already responded
        // prevent - Error: Can't set headers after they are sent.
        // occurs when res.send or res.end already happend before
        if (this.res.headersSent) {
            return this.req.socket.destroy();
        }

        const page = utils.string.capitalizeFirst(this.page);
        // set all data inside viewmodel object
        let model = this.req.app.get('viewmodel') ? { viewmodel } : viewmodel;

        // Execute beforeRender interceptor
        // Passing only {model} and {this.req}
        // beforeRender should be used only for changing {model}
        this.beforeRender(model, this.req, (beforeRenderErr, beforeRenderModel) => {
            if (!beforeRenderErr) {
                model = beforeRenderModel;

                if (template) {
                    // Render a {template} and send the rendered HTML string to the client
                    this.res.render(template, model, (renderErr, html) => {
                        // Error in/or during rendering {template}
                        if (renderErr) {
                            //
                            renderErr.message = `Can not render "${template}" template: ${renderErr.message}`;
                            // Pass error to internalError middleware
                            this.error(renderErr);
                            //
                        } else {
                            // Execute afterRender interceptor
                            // Passing only {model} and {html}
                            // {this.req} and {this.res} should not be called or modified in {afterRender}
                            this.afterRender(model, html, (afterRenderErr, afterRenderModel, afterRenderHtml) => {
                                if (!afterRenderErr) {
                                    logger.debug(`Rendering ${page} template...`);
                                    metrics.increment(`Server.Request.${page}.Render`);

                                    // Send response
                                    this.res.send(afterRenderHtml);
                                } else {
                                    // Pass error to internalError middleware
                                    this.error(afterRenderErr);
                                }
                            });
                        }
                    });
                } else {
                    logger.debug(`Sending ${page} JSON response...`);
                    metrics.increment(`Server.Request.${page}.Json`);

                    // Set content type
                    this.res.setHeader('Content-Type', 'application/json; charset=utf-8');
                    // Send JSON response
                    this.res.json(model);
                }
            } else {
                // pass error to internalError middleware
                this.error(beforeRenderErr);
            }
        });
    }

    // @TODO - analyze all cases, create type errors
    prepareError (err, viewmodel, isJson) {
        let error = null;

        // if err is not valid
        // create Error object
        if (!(err instanceof Error)) {
            // api returned object with message and status code
            // status code could be 500 or 404
            if (err.message) {
                if (err.message instanceof Buffer) {
                    const decoder = new StringDecoder('utf8');
                    error = new Error(decoder.write(err.message));
                } else {
                    error = new Error(utils.object.isObject(err.message) ? utils.json.safeStringify(err.message) : err.message);
                }
            } else {
                error = Error('Internal Server Error!');
            }
        } else {
            // error is in right format (instanceof Error)
            error = err;
        }

        // set json flag
        error.jsonResponse = isJson;

        // set statusCode to 503 if it is not defined
        error.statusCode = err.statusCode || 503;

        // attach viewmodel
        error.viewmodel = viewmodel || false;

        return error;
    }

    // Forward Request to another Controller
    //
    // Example
    //
    // this.forward('Detail:getAction', { vin: 'KNDPM3AC2H7247245' });
    //
    // Controller A forwarding to Controller B action
    // Controller B will render data and return response
    //
    // == Controller A ==
    // getAction (params) {
    //     this.forward('Home:getAction', { make: 'Acura', model: 'CL' });
    // };
    //
    // == Controller B ==
    // getAction (params) {
    //     this.json(null, params);
    // };
    forward (handler = '', params) {
        const handlerAction = handler.split(':');
        let pageName = handlerAction.shift();
        let actionName = handlerAction.length ? handlerAction.shift() : undefined;

        if (actionName.indexOf('Action') !== -1) {
            // removing trailing "Action"
            actionName = actionName.replace('Action', '');
        }

        if (pageName) {
            const Controller = this[getController](pageName);
            const controller = new Controller;
            // get Controller Action
            const action = controller.use(actionName, pageName);

            // rewrite {page} and {params}
            this.req.page = pageName.toLowerCase();
            this.req.params = params;

            return action(this.req, this.res, this.next);
        } else {
            throw new Error('Forward handler is not defined!');
        }
    }
}

module.exports = BaseController;
