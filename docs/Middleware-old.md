## [Middleware](https://stash.vast.com/projects/EXPRESSO/repos/rhema/browse/lib/middleware/index.js)

##### Wrapper around Express Middleware with configuration-based middleware registration for declaring middleware type, path, priority and settings. 
---
### Using middleware
**Middleware** functions are functions that have access to the request object (`req`), the response object (`res`), and the next middleware function in the application’s request-response cycle. The `next` middleware function is commonly denoted by a variable named `next`.

If the current middleware function does not end the request-response cycle, it must call `next()` to pass control to the next middleware function. Otherwise, the request will be left hanging.

Rhema supports using the following types of middleware:

- `initial` - Application level middlewares and they will be executed on **every route** (app and static routes) and **every time** the app receives a request. 

- `route:invoked` - Route level middlewares and they will be executed on specific routes defined in config.

- `route:after` - Error-handling middleware functions for handling exceptions (`internalError`) and non valid urls (`notFound`) 

---
### Options
- **`module`**
    - **`path`**: [**string**, required] - Path to specific middleware, local ("./middleware/lib/route-level" or "./middleware/lib/app-level") or npm ("compression" or "helmet").
    
    - **`method`**: The method on the provided module upon which invocation will create the middleware function to register. Useful if we are using middleware that has more than one methods, like "body-parser" (json or urlencoded)
    
    -  **`arguments`**: [**array**, optional] Array of options that will be injected as middleware arguments. **Note** that you will have to create wrapper arround middleware and in that case you can also use dependency injection.
        ```
        // middleware config
        "formats": {
            "module": {
                "path": "./middleware/lib/route-level/formats.js",
                "arguments": [{"formats": ["xml", "json"]}]
            }
        }
        ```
        ```
        // formats.js
        module.exports = function Formats (options, $helpers) {
            return function (req, res, next) {
                // options.formats => ["xml", "json"]
                // e.g. $helpers.formatUrl()
                next();
            };
        };
        ```
    
- **`priority`**: [**number**, optional] - Represents order number to give a particular middleware priority for execution. Lower numbers are registered first. If priority is not a number, middleware will be registered as last in the order. 

- **`paths`**: [**array**, optional] - Route paths on which middleware should be registered or ignored. Can be a `route name` which **should match route name in router config** and have support for **negation** if we want to exclude middleware on some route,  or `asterisk` which means `all app defined routes`.  `paths` **should be used** only for `route:invoked` middlewares.

    ```
    // include on all app paths
    "catchException": {
        "paths": ["*"], 
        "module": {
            "path": "./middleware/lib/route-level/catchException.js",
            "arguments": []
        }
    }
    ```
    ```
    // include only on "search"
    "csrf": {
        "paths": ["search"],
        "module": {
            "path": "csurf",
            "arguments": [{
                "cookie": true
            }]
        }
    }
    ```
    ```
    // exclude only on "detail"
    "formats": {
        "priority": 6,
        "paths": ["!detail"],
        "module": {
            "arguments": [{"formats": ["xml", "json"]}],
            "path": "./middleware/lib/route-level/formats.js"
        }
    }
    ```
- **`enabled`**: [**boolean**] (Default: `true`) - Set to true to enable middleware, false to disable.

- **`env`**: [**string**] (Default: 'prod') - Environment level of execution. For middlewares that should or shouldn't be visible on particular environment:
    
    - `dev` - **only dev env** - '*dev*', '*develop*', '*development*'
    - `!dev` - **exclude only dev env** - 'alpha', 'beta', 'prod', 'production'
    - `alpha` - **dev and alpha env** - '*dev*', '*development*', '*alpha*'
    - `!alpha` - **exclude dev and alpha env** - '*beta*', '*prod*', '*production*'
    - `beta` - **dev, alpha and beta env** - '*dev*', '*develop*', '*development*', '*alpha*', '*beta*'
    - `!beta` - **exclude dev, alpha and beta env** - '*production*', '*prod*'
    - `prod` - **all env** - '*dev*', '*develop*', '*development*', '*alpha*', '*beta*', '*production*', '*prod*'
    - `!prod` - **disable for all env**

---
### Epresso Middlewares

##### Rhema has predefined `middleware` object in [`baseConfig`](https://stash.vast.com/projects/EXPRESSO/repos/rhema/browse/lib/app/baseConfig.json) for including esential third-party or built-in middlewares that brings Rhema very important features for easier handling security issues, catching unhandled errors, cookie parsing, serving static files, vhosts, basic-auth etc. For every predefined middleware we can overwrite options from `application config`.

List of Rhema middlewares:

- **initial**
    - [compression](https://github.com/expressjs/compression) -  deflate and gzip compression.
    
    - [express.static](https://expressjs.com/en/guide/using-middleware.html#middleware.built-in) - The only Express built-in middleware and it is responsible for serving static assets such as HTML files, images, and so on.
    
    - [set-namespaces](https://stash.vast.com/projects/EXPRESSO/repos/rhema/browse/lib/middleware/lib/app-level/setNamespaces.js) - set namespace for `registry` which is used for binding request and response to [`continuation-local-storage`](https://github.com/othiym23/node-continuation-local-storage) namespace.
    
    - [basic-auth](https://stash.vast.com/projects/EXPRESSO/repos/rhema/browse/lib/middleware/lib/app-level/basicAuth.js) - wrapper around [generic basic auth Authorization header field parser
](https://github.com/jshttp/basic-auth)

    - [serve-favicon](https://stash.vast.com/projects/EXPRESSO/repos/rhema/browse/lib/middleware/lib/app-level/serve-favicon.js) - Forked and modified to work with subdomain favicons [serve-favicon](https://github.com/expressjs/serve-favicon)

    - [body-parser](https://github.com/expressjs/body-parser) (json, urlencoded) - Parse incoming request bodies in a middleware before your handlers, available under the req.body property.

    - [cookie-parser](https://github.com/expressjs/cookie-parser) - Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
    
    - [cors](https://github.com/expressjs/cors) - Enable Cross Origin Resource Sharing.
    
    - [helmet](https://github.com/helmetjs/helmet) (hsts, frameguard, xssFilter, ieNoOpen) - Helps you secure your Express apps by setting various HTTP headers.
    
    - [cache-buster](https://stash.vast.com/projects/EXPRESSO/repos/rhema/browse/lib/middleware/lib/route-level/cacheBuster.js) - creating chache buster from (buld.json || package.json)

- **route:invoked**
    - [request-timeout](https://stash.vast.com/projects/EXPRESSO/repos/rhema/browse/lib/middleware/lib/route-level/requestTimeout.js) - Handle Request timeout.

    - [request-time](https://stash.vast.com/projects/EXPRESSO/repos/rhema/browse/lib/middleware/lib/route-level/requestTime.js) - Mesure Request latency time.

    - [set-headers](https://stash.vast.com/projects/EXPRESSO/repos/rhema/browse/lib/middleware/lib/route-level/setHeaders.js) - Allows setting particular headers from config.
    
    - [sanitize-request](https://stash.vast.com/projects/EXPRESSO/repos/rhema/browse/lib/middleware/lib/route-level/sanitizeRequest.js) - Based on [xss](https://github.com/leizongmin/js-xss) Sanitize request to prevent XSS attempts.
    
    - [trailingSlash](https://stash.vast.com/projects/EXPRESSO/repos/rhema/browse/lib/middleware/lib/route-level/trailingSlash.js) - Redirect to route without trailing slash.

    - [formats](https://stash.vast.com/projects/EXPRESSO/repos/rhema/browse/lib/middleware/lib/route-level/formats.js) - Allows having urls with e.g. `.json` at the and which will return json instead of HTML.

    - [catchException](https://stash.vast.com/projects/EXPRESSO/repos/rhema/browse/lib/middleware/lib/route-level/catchException.js) - Based on [domain](https://nodejs.org/api/domain.html) module which bind request and response objects and catch unhadled exceptions happend during the request and response.

    - [csrf](https://github.com/pillarjs/csrf) - support for CSRF tokens.

- **route:after**
    - [notFound](https://stash.vast.com/projects/EXPRESSO/repos/rhema/browse/lib/middleware/lib/route-level/notFound.js) - Handling 404 error throwed from Router when route is not found.

    - [internalError](https://stash.vast.com/projects/EXPRESSO/repos/rhema/browse/lib/middleware/lib/route-level/internalError.js) - Error handler for 50X errors passed from other middlewares.






