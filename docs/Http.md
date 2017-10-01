# Http

This Module is used to extend [Express Request](https://expressjs.com/en/4x/api.html#req) and [Express Response](https://expressjs.com/en/4x/api.html#res) objects. In general we add commonly used methods for manipulating controller action parameters.

# Request
## getQuery
This method get query object from current Request. Returns Object as clone of [req.query](https://expressjs.com/en/4x/api.html#req.query) or empty object.

## getParams
This method get params object from current Request. Returns Object as clone of [req.params](https://expressjs.com/en/4x/api.html#req.params) or empty object.

## getFullUrl
This method adds posibility to get full url from Request. Returns String built from [req.protocol](https://expressjs.com/en/4x/api.html#req.params), `req.headers['host']` and [req.originalUrl](https://expressjs.com/en/4x/api.html#req.originalUrl).

## getUserAgent
This method parses User-Agent from Request header, and returns it as parsed Object for better usage. Libriray used for parsing is [useragent](https://www.npmjs.com/package/useragent).

## isJson
This method is used to determine is this Request `json` formated. Returns Boolean value.

## getHeader
This method is getter for header object. Method param is `name`, and if there is no value for given param `null` is returned. 

## setHeader
This method is setter for header object. Method params are `name` and `value`. Method does not have returning value.

## setSpaReferer
This method is setter for Single Page Application referer. Method is checking for  `x-spa-referer` and `x-spa-referer-page` in headers and set `this.headers.refererPage` according to existance of one of the header flags. Method does not have returning value.

## getCookie
This method is cookie value getter. Method param is `cookieName`. Returns cookie value or `null`.

## getClientIp
This method is getter for client IP from headers in current Request. Method lookks in headers for `x-cluster-client-ip`, `X-Request-IP`, `x-forwarded-for`, `X-Forwarded-For`, `x-client-ip`, `x-real-ip`, `forwarded-for`, `forwarded` or `req.connection.remoteAddress` or `req.socket.remoteAddress`. Any of this may contain value for clients IP address. Method param is `forcedIP` that shold be returned if passed in. Returns IP or `null`.


# Response

