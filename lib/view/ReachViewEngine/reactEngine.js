'use strict';

const React = require('react');
const ReactDOM = require('react-dom/server');
const pages = require(`../../build/js/pages.${process.env.NAME}.bundle.js`);
const StaticRouter = require('react-router-dom').StaticRouter;
const ReactCookie = require('react-cookie');
const Cookies = require('universal-cookie');
const { Helmet } = require('react-helmet');

/**
 * React server renderer function
 * Function renders required pre-built page template
 * Engine was purposely built without es2015 syntax,
 * so we could avoid wrapping the app instance inside of a babel preset
 *
 * @param  {string}   pageName page template name to render
 * @param  {object}   pageData Redux.Provider store raw data, passed by the Expresso controller
 * @param  {Function} next     callback function
 * @return {void}
 */
module.exports = function (pageName, pageData, next) {
    pageData.viewmodel = pageData.viewmodel || {};
    pageData.viewmodel.meta = pageData.viewmodel.meta || {};
    pageData.viewmodel.csrf = pageData.csrf ? pageData.csrf : null;
    pageData.viewmodel.meta.page = pageName;
    const layoutPageToUse = 'layouts/main';

    const url = pageData.viewmodel.url || '';
    const cookiesHeader = pageData.viewmodel.cookiesHeader || '';

    const serverRoutes = pageData.core.routeTable;
    const rewriterConfig = pageData.rewriterConfig;

    // no need for now, if we change error page layout, do it here
    // if (pageName === 'error/500' || pageName === 'error/503') {
    //     layoutPageToUse = 'layouts/500';
    // }

    // Create current page component React.Element
    // Current page compiled component. Defaults to NotFound component
    pageData.viewmodel.meta = Object.assign({}, {
        title: '',
        description: ''
    }, pageData.viewmodel.meta);

    const props = Object.assign({}, pageData.viewmodel, { tenant: pageData.appConfig });
    const PageElement = React.createElement(pages(pageName), props);

    const UrlRewriterContextContext = React.createElement(pages('urlRewriterContext'), {
        serverRoutes: serverRoutes,
        rewriter: rewriterConfig
    }, PageElement);

    const StaticRouterContext = React.createElement(StaticRouter, { context: {}, location: url || '' }, UrlRewriterContextContext);
    const CookiesProvider = React.createElement(ReactCookie.CookiesProvider, { cookies: new Cookies(cookiesHeader) }, StaticRouterContext);

    // Create Layout component React.Element
    const layoutElement = React.createElement(pages(layoutPageToUse), {
        pageData: pageData,
        pageHtml: ReactDOM.renderToString(CookiesProvider)
    });

    // Render the current layout to HTML static markup
    // We only need the PageElement rendered and handled by react at this point
    const staticMarkup = `<!DOCTYPE html> ${ReactDOM.renderToStaticMarkup(layoutElement)}`;

    // Because this component keeps track of mounted instances, you have to make sure to call renderStatic on server, or you'll get a memory leak.
    Helmet.renderStatic();

    next(null, staticMarkup);
};
