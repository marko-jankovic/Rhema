# Services

Services are used for building reusable circularly connected components powered by Dependency Injector. Services can be injected and used in every Controller Action, Model, Middleware, Pipeline or it can be executed initialy, at begining of application bootstrap and before server start.

## Configuring Services
Configuration for services must be placed inside `app.services` object.

Example: `services.yaml`
```yaml
---

helper:
  validator:
    path: "./app/services/utils.js"
    method: "getValidator"
    options:
      whiteList: ["error"]

  date:
    path: "./app/services/utils.js"
    method: "getDate"
    options:
      whiteList: ["error"]

formatter:
  pluralize:
    path: "./app/services/pluralize.js"

gateway:
  cacheData:
    refreshTime: 86400000
    path: "./app/services/cacheData.js"
    options:
      "apiUrl": "www.example.com/getJson"
```

### helper/formatter/gateway
It is just a namespace. You can use whatever you think it is appropriate, based on Service type. Namespace object is **mandatory**, you can't define Service without namespace object. 

Recomended namespaces are:
- `helper` (complex business logic with service "options")
- `formatter` (very simple logic with input and output e.g. pluralize method)
- `gateway` (requests to some external APIs).

### validator/date/pluralize
These are names for services. You will use that name to call service through the application. It is recomended to have the same Service name as file name. 

### path
Service path is required and without `path` application will throw Error Exception.

### options
Options are optional and if it is not defined service will have first argument set as empty object `{}`.
 
### method
Used for creating specific exported method as service.
 
### refreshTime
Time interval (in miliseconds) after `initialize` method will be triggered again. If it is not defined, `initialize` will be executed only once. It makes sense to use class here since you need `initialize` method.

## Creating a Service

Service MUST be a function and it will always have injected "options" as first argument. Other DI arguments are specified with dollar notation (`$helpers` OR `$api = 'gateway.api'`) and must follow namespaces defined in services config. 

### Single action services
For "single action" service it is recommended to use carrying pattern, where we use first function to receive options, and second to receive arguments.

```js
module.exports = options => input => {
    return `${input}'s';
}
```

### Comples logic services
For services that require complex logic or exporting multiple methods, it is recommended to use class.
```js
module.exports = class Date {
    constructor (options, $formatters) {
        this.$formatters = $formatters;
    }

    ago (date) {
        const interval = Math.floor(seconds / 60);

        return `${interval} ${this.$formatters('minute')} ago`;
    }

    getMonth () {
        return new Date().getMonth() +  1;
    }
}
```

### Initialize services
Services that needs to be executed initialy and refreshed after some interval time MUST have defined `initialize` method and triggered `done` callback.

```js
module.exports = class CacheData {
    constructor (options, $gateway) {
        this.options = options;
        this.$gateway = $gateway;
        this.$cache = {};
    }

    initialize (done) {
        this.$gateway.fetchData(this.options.apiUrl)
            .then((data) => {
                this.$cache = data;
                done();
            });
    }
}
```

!> If you use `this.$cache` property to store the data, that data will be available through `/core/cache/{{ category }}-{{ type }}` route. For example: `/core/cache/gateway-constraints`. Read more about predefined routes on [router page](Router.md?id=predefined-routes).

## Using services

### Using Services in Middleware
```js
module.exports = (options, $gateway) => (req, res, next) => {
    res.json($gateway.cacheData.$cache);
};
```

### Using Service in Controller
```js
getAction (req, res, $helpers) {
    const redirectUrl = $helpers.rewriter.formatUrl('search', { location: 11211 });
    res.redirect(301, redirectUrl);
}
``` 

### Using Service in Model
```js
async fetch (params) {
    const data = await this.$gateway.api(params);
    return data;
}
``` 

### Using Services in Pipeline
```js
module.exports = (options, $gateway) => (data, next) => {
    $gateway.attributesApi.fetchAll(data.params, (err, facets) => {
        next(err, Object.assign(data, { facets }));
    });
};
```
