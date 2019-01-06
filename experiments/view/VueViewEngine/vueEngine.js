'use strict';

const fs = require('fs');
const path = require('path');
const isProd = require('../env').isProd;
const { createBundleRenderer } = require('vue-server-renderer');
// Load only in production mode in dev mode these files are served from memory
const serverBundle = isProd ? require('../../build/vue-ssr-server-bundle.json') : null;
const clientManifest = isProd ? require('../../build/vue-ssr-client-manifest.json') : null;
const template = fs.readFileSync(path.resolve(__dirname, '../../client/layout/index.template.html'), 'utf-8');

const setupDevServer = (cb) => {
    let resolve;
    const readyPromise = new Promise((r) => {
        resolve = r;
    });
    global.ready = (...args) => {
        resolve();
        cb(...args);
    };

    return readyPromise;
};

module.exports = function () {
    let renderer;
    let readyPromise;

    if (isProd) {
        renderer = createBundleRenderer(serverBundle, {
            runInNewContext: false,
            template: template,
            clientManifest: clientManifest,
            shouldPrefetch: (file, type) => {
                return !file.includes('microdb-web.js');
            }
        });
    } else {
        readyPromise = setupDevServer((bundle, options) => {
            renderer = createBundleRenderer(bundle, Object.assign(options, {
                runInNewContext: false,
                template: template
            }));
        });
    }

    const render = (pageData, next) => {
        // Indicate that data is already fetched and client doesn't have to do it again
        pageData.clientEnv = false;
        // Render the current layout to HTML static markup
        // We only need the PageElement rendered and handled by react at this point
        renderer.renderToString(pageData, (err, html) => {
            next(err, html);
        });
    };

    return function (pageName, pageData = {}, next) {
        if (isProd) {
            render(pageData, next);
        } else {
            readyPromise.then(() => {
                render(pageData, next);
            });
        }
    };
};
