# Built-in Middleware Functions

Rhema comes with a set of built-in middleware functions.

You can override them in the applications configuration file (e.g. `middleware.yaml`).

This is the list of built-in middleware functions:

- All Routes Middleware
    - [Compression](Built-in-Middleware-Functions.md?id=compression)
    - [Basic Auth](Built-in-Middleware-Functions.md?id=basic-auth)
    - [Static Info](Built-in-Middleware-Functions.md?id=static-info)
    - [Serve Static](Built-in-Middleware-Functions.md?id=serve-static)
    - [Serve Favicon](Built-in-Middleware-Functions.md?id=serve-favicon)
    - [Cache Buster](Built-in-Middleware-Functions.md?id=cache-buster)

- Router Invoked Middleware
    - [Request Time](Built-in-Middleware-Functions.md?id=request-time)
    - [Body Parser JSON](Built-in-Middleware-Functions.md?id=body-parser-json)
    - [Body Parser URL Encoded](Built-in-Middleware-Functions.md?id=body-parser-url-encoded)
    - [Sanitize Request](Built-in-Middleware-Functions.md?id=sanitize-request)
    - [Redirect](Built-in-Middleware-Functions.md?id=redirect)
    - [Set Namespaces](Built-in-Middleware-Functions.md?id=set-namespaces)
    - [Set Headers](Built-in-Middleware-Functions.md?id=set-headers)
    - [Catch Exception](Built-in-Middleware-Functions.md?id=catch-exception)
    - [Cookie Parser](Built-in-Middleware-Functions.md?id=cookie-parser)
    - [CORS](Built-in-Middleware-Functions.md?id=cors)
    - [Helmet](Built-in-Middleware-Functions.md?id=helmet)
    - [CSRF](Built-in-Middleware-Functions.md?id=csrf)
    - [Status Info](Built-in-Middleware-Functions.md?id=status-info)
    - [Process Messages](Built-in-Middleware-Functions.md?id=process-messages)
    - [Get Client IP](Built-in-Middleware-Functions.md?id=get-client-ip)
    - [Merge Params](Built-in-Middleware-Functions.md?id=merge-params)
    - [Request Info](Built-in-Middleware-Functions.md?id=request-info)

- Before Render Middleware
    - [Attach Beatle Data](Built-in-Middleware-Functions.md?id=attach-beatle-data)
    - [Attach Query Value](Built-in-Middleware-Functions.md?id=attach-query-value)
    - [Attach Request Field](Built-in-Middleware-Functions.md?id=attach-request-field)
    - [Show Only](Built-in-Middleware-Functions.md?id=show-only)
    - [Exclude Only](Built-in-Middleware-Functions.md?id=exclude-only)
    - [Viewmodel Cleanup](Built-in-Middleware-Functions.md?id=viewmodel-cleanup)

- After Render Middleware
    - [Insert Beatle Template](Built-in-Middleware-Functions.md?id=insert-beatle-template)
    - [Insert Error Handler](Built-in-Middleware-Functions.md?id=insert-error-handler)
    - [Minify HTML](Built-in-Middleware-Functions.md?id=minify-html)

- Route Error Middleware
    - [Not Found](Built-in-Middleware-Functions.md?id=not-found)
    - [Internal Error](Built-in-Middleware-Functions.md?id=internal-error)

!> Built-in Middleware functions should be overridden if you are sure you know what you're doing.

## Compression

This middleware compresses response bodies for all request that traverse through the middleware. Override example:

```yaml
allRoutes:
  compression:
    envLevel: prod
    path: compression
    options:
      level: 1      # Default level is -1
      threshold: 10 # Default threshold is 9
```

More information can be found in [package readme](https://www.npmjs.com/package/compression).

## Basic Auth

Wrapper middleware function around [basic-auth package](https://www.npmjs.com/package/basic-auth). Checks if credentials are defined for the given routes and denies access if not.

```yaml
allRoutes:
  basicAuth:
    envLevel: prod
    path: "./lib/middleware/lib/allRoutes/basicAuth.js"
    options:
      password: "{% framework.security.basicAuth %}"
      routes:
        profiler: "/profiler"
        core: "/core"
        beatle: "[\\?&]beatle="
        broadcast: "[\\?&]broadcast="
        somethingSecure: "/secure" # Additional route added, rest is default...
```

## Static Info

Prints information for the requested asset to the console. Handled assets are:

- .js
- .txt
- .png
- .jpg
- .gif
- .css
- .svg
- .ico

## Serve Static

Serves files from a given root directory. When a file is not found, instead of returning a 404 response, this module will call `next()` function and move on to the next middleware.

By default following folders are considered as root directories: `build`, `static` and `dynamic`.

Example of custom static file paths:

```yaml
allRoutes:
  shortcached:
    path: serve-static
    options:
    - build/shortcached
    - maxAge: '0'
      index: false
      etag: true
      dotfiles: deny
      lastModified: true
      redirect: false
  longcached:
    path: serve-static
    options:
    - build/longcached
    - maxAge: 3d
      index: false
      etag: true
      dotfiles: deny
      lastModified: true
      redirect: false
```

More information can be found in [package readme](https://www.npmjs.com/package/serve-static)

## Serve Favicon

Serves favicon from the `./build/img` or `./build/img/favicons` path.

Custom path can be specified by overriding configuration file:

```yaml
serve-favicon:
  path: "./lib/middleware/lib/allRoutes/serve-favicon.js"
  options:
    - "./build/img/favicon.ico"
    - subdomainFolder: "./build/img/favicons"
```

## Cache Buster

Adds unique hash to the end of the file so browsers can always receive the most recently updated files.

## Request Time

Measures middleware functions latency, sends that information to the metrics and prints it to the console.

By default it's triggered for every route. Routes can be defined in the applications configuration file.

Next example illustrates how to avoid triggering this middleware function for sitemap path:

```yaml
requestTime:
  routes: "!sitemap"
  path: "./lib/middleware/lib/routeInvoked/requestTime.js"
```

## Body Parser JSON

Parses incoming JSON request bodies. For more information about available options visit [package readme](https://www.npmjs.com/package/body-parser).

## Body Parser URL Encoded

Parses incoming URL encoded request bodies. For more information about available options visit [package readme](https://www.npmjs.com/package/body-parser).

## Sanitize Request

Sanitizes request fields to protect client from [XSS attacks](https://en.wikipedia.org/wiki/Cross-site_scripting).

By default `url`, `params`, `query`, `queryAndParams`, `body` field of the request will be sanitized.

This middleware is wrapper around NPM's [XSS package](https://www.npmjs.com/package/xss). More information about `xssOptions` can be found there.

In the applications configuration file request fields can be omitted or added.

```yaml
sanitizeRequest:
  routes: ["*"]
  path: "./lib/middleware/lib/allRoutes/sanitizeRequest.js"
  protectArguments: false
  options:
    # Specify request fields to get sanitized
    reqFields:
      - url
      - params
      - query
      - queryAndParams
      - body
      - custom
    xssOptions: {}
```

## Redirect

Forces redirections for the following cases:
- Secure Connection - `http://www.carstory.com` -> `https://www.carstory.com`
- Connection with trailing slash - `https://www.carstory.com/cars/` -> `https://www.carstory.com/cars`
- WWW connection - `https://carstory.com` -> `https://www.carstory.com`

By default `trailingSlash` is enforced.

To override it do following:

!> Note that `forceWww` option is not working properly.

```yaml
redirect:
  envLevel: prod
  routes: ["*"]
  path: "./lib/middleware/lib/routeInvoked/redirect.js"
  options:
    forceWww: false
    forceSecure: true # Default is false
    trailingSlash: true
```

## Set Namespaces

!> More information should be provided for this middleware function.

Sets namespaces that will be used for set/get data for continuation local storage.

## Set Headers

Sets headers defined in configuration file. By default `Cache-Control` and `Content-Type` headers are set. This middleware function is applied for every route except the `cache` route.

Default configuration:

``` yaml
setHeaders:
  routes: ["!cache"]
  path: "./lib/middleware/lib/routeInvoked/setHeaders.js"
  options:
    Cache-Control: no-cache, no-store
    Content-Type: text/html; charset=utf-8
```

## Catch Exception

!> More information should be provided for this middleware function.

Domain emits 'error' when it's given an unhandled error.

## Cookie Parser

Parses cookie header and populates `req.cookies` with an object keyed by the cookie names. Optionally you may enable signed cookie support by passing a secret string, which assigns req.secret so it may be used by other middleware.

More information can be found in [package readme](https://www.npmjs.com/package/cookie-parser).

## CORS

Sets HTTP headers to let a user agent gain permission to access selected resources from a server on a different origin (domain) than the site currently in use. By default it's enabled for the following HTTP methods: `GET`, `HEAD`, `PUT`, `PATCH`, `POST`, `DELETE`.

To add or omit HTTP methods do the following:

```yaml
cors:
  routes: ["*"]
  path: "cors"
  protectArguments: false
  options:
    origin: "*"
    methods: "GET,HEAD,PUT,PATCH,POST" # Remove CORS support for DELETE method
    preflightContinue: false
    optionsSuccessStatus: 204
```

More information can be found in [package readme](https://www.npmjs.com/package/cors).

## Helmet

Helmet is a middleware group responsible for applications security. Each of them sets HTTP header.

By default Rhema sets four different headers for all routes:

- [HSTS](https://helmetjs.github.io/docs/hsts/)
- [Frameguard](https://helmetjs.github.io/docs/frameguard/)
- [XSS Filter](https://helmetjs.github.io/docs/xss-filter/)
- [IE No Open](https://helmetjs.github.io/docs/ienoopen/)

Get full list of helmet's security models on the [npm's site](https://www.npmjs.com/package/helmet).

## CSRF

Sets [CSRF](https://en.wikipedia.org/wiki/Cross-site_request_forgery) token for every request to prevent CSRF attack.

Default configuration:

``` yaml
csrf:
  routes: ["!clientSideError"]
  path: csurf
  options:
    cookie: true
```

More information can be found in [package readme](https://www.npmjs.com/package/csrf).

## Status Info

!> More information should be provided for this middleware function.

## Process Messages

!> More information should be provided for this middleware function.

Sends message from child process to master process.

## Get Client IP

!> More information should be provided for this middleware function.

Gets client IP from the header and sets to request clientIP

## Merge Params

Merges rest and query params into new field of the `req` object. By default it blacklists `format` and `beatle` from merge process.

## Request Info

Writes request information to Beatle.

## Attach Beatle Data

Attaches beatle data to `viewmodel`.

## Attach Query Value

Attaches whitelisted queries value to the `viewmodel` and `locals`. By default `skipExternals` is the only whitelisted query.

## Attach Request Field

Attaches request field to the `viewmodel`.

## Show Only

Middleware function to show specific field in the `viewmodel`.

## Exclude Only

Exludes specific field from the `viewmodel`.

## Viewmodel Cleanup

Remove blacklisted fields from the `viewmodel`. Non is blacklisted by default. To add field that should be blacklisted to the following:

```yaml
cleanupViewmodel:
  path: "./lib/middleware/lib/beforeRender/cleanupViewmodel.js"
  options:
    blackList:
      - testField
      - blacklist
```

## Insert Beatle Template

Inserts Beatle template if `beatle` query is present in the request.

## Insert Error Handler

Inserts error handler at the end of the HTML's body tag.

## Minify HTML

Minifies HTML. This middleware is wrapper around [html-minifier](https://www.npmjs.com/package/html-minifier).

This middleware is disabled by default.

To customize it add following to the applications configuration file:

```yaml
minifyHTML:
  enabled: true
  path: "./lib/middleware/lib/afterRender/minifyHTML.js"
  options:
    removeComments: true
    removeCommentsFromCDATA: true
    collapseWhitespace: true
    collapseBooleanAttributes: true
    removeAttributeQuotes: true
    removeEmptyAttributes: true
```

For full list of middleware options check [html-minifier's options](https://www.npmjs.com/package/html-minifier).

## Not Found

Handles 404 errors by setting status code and rendering proper error template.

## Internal Error

Error handler for 50X errors.