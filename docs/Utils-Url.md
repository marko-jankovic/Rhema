# URL utils
In order to use URL utils the following line needs to be included in the file.
```js
const utils = require('rhema').Utils;
```

## getRelativeUrl (absoluteUrl)
This function removes the domain and returns everyting after first / (including /)

**Arguments**
- `absoluteUrl` **{string}** - absolute URL of interest

**Return**
- **{string}** - relative URL

```js
let relativeURL = utils.url.getRelativeUrl('http://domain.com/p/a/t/h?foo=bar')
// relativeURL = '/p/a/t/h?foo=bar';
```

---

## getAbsoluteUrl(relativeUrl, request)

This function composes absolute URL from relative path and request.

**Arguments**
- `relativeUrl` **{string}** - relative path
- `request` **{object}** - object whose property is headers (among other available properties) { headers: { host: 'domain.com' } }

**Return**
- **{string}** - returns composed relative URL

```js
let absolutePath = utils.url.getAbsoluteUrl('/p/a/t/h', { headers: { host: 'domain.com' } })
// absolutePath = '//domain.com/p/a/t/h';
```

---

## getHostname(path, keepWWW)

This function returns the hostname/domain of the abosulte path.

**Arguments**
- `path` **{string}** - absolute path
- `keepWWW` **{boolean}** - default is flase, set to true if www needs to be preserved

**Return**
- **{string}** - returns domain

```js
let hostname = utils.url.getHostname('http://www.domain.com/p/a/t/h', true);
// hostname = 'www.domain.com';
```

```js
let hostname = utils.url.getHostname('http://domain.com/p/a/t/h');
// hostname = 'domain.com';
```

---

## isRelativeUrl(url)

This function checks if the URL is relative.

**Arguments**
- `url` **{string}** - URL path

**Return**
- **{boolean}** - returns true if the URL is relative

```js
let isRelative = utils.url.isRelativeUrl('/p/a/t/h?foo=bar');
// isRelative = true;
```

```js
let isRelative = utils.url.isRelativeUrl('http://www.domain.com/p/a/t/h');
// isRelative = false;
```

---

## isAbsoluteUrl(url)

This function checks if the URL is absolute.

**Arguments**
- `url` **{string}** - URL path

**Return**
- **{boolean}** - returns true (false) if the URL is (not) absolute

```js
let isRelative = utils.url.isAbsoluteUrl('/p/a/t/h?foo=bar');
// isRelative = false;
```

```js
let isRelative = utils.url.isAbsoluteUrl('http://www.domain.com/p/a/t/h');
// isRelative = true;
```

---

## getFullUrl(req, protocol)

This function composes the URL from provided request and protocol.

**Arguments**
- `req` **{Object}** - object with the following properties: hostname, relative path, protocol(optional), ie: { protocol: 'http', hostname: 'domain.com', url: '/p/a/t/h?foo=bar' }
- `protocol` **{string}** - optional, specifieces protocol

**Return**
- **{string}** - fully composed URL

```js
let req = { protocol: 'http', hostname: 'domain.com', url: '/p/a/t/h?foo=bar' };
let fullURL = utils.url.getFullUrl(req);
// fullURL = 'http://domain.com/p/a/t/h?foo=bar';
```

```js
let req = { hostname: 'domain.com', url: '/p/a/t/h?foo=bar' };
let fullURL = utils.url.getFullUrl(req, 'http');
// fullURL = 'http://domain.com/p/a/t/h?foo=bar';
```

---

## sanitizePath(path)

This function clenas up (sanitize) the relative path of the URL from slasches 

**Arguments**
- `path` **{string}** - some relative path that needs to cleaned 

**Return**
- **{string}** - cleaned relative path

```js
let sanitizedPath = utils.url.sanitizePath('/p/a///t/h/');
// sanitizedPath = '/p/a/t/h';
```

---