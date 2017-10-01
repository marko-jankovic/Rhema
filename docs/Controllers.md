# Controllers

Controllers provide rendering helpers, request forwards, etc. Controller methods are executed after middleware functions.

!> **Each controller method should be route handler. That being said, no helper methods or similar should be placed inside controllers.**

All controllers should extend `Rhema.Controller`.

```js
// detailController.js
class DetailController extends Rhema.Controller {
    getAction (req, res) {
        this.render(null, { message: 'Hello World!' });
    }
}
```

## Naming convention
### Filenames
Controllers filenames should be `lowerCamelCased` with word `Controller` in the end, e.g. `searchController.js` or `detailController.js`.

### Class names
Class names should be `UpperCamelCassed` with word `Controller` in the end, e.g. `SearchController` or `DetailController`.

### Method names
Methods should be `lowerCamelCased` with word `Action` in the end, for example: `getAction`, `storeAction`, `leadValidationAction`, etc.

## Matching routes
Some methods are automatically used for specific HTTP methods. Read more about that on [Router page](Router.md?id=auto-match).

## JSON routes
Each controller method can return `json` response when `.json` is appended to the route path, or if specific header is passed.
You can read more about it on [Router page](Router.md?id=json-routes).

## Dependency Injection
Services are injected to controllers as arguments after request and response objects.

```js
class StatsController extends Rhema.Controller {
    async getAction (req, res, $gateway) {
        const data = await $gateway.api.fetch(req.params);
        this.json(null, data);
    }
}
```

## Request and Response
These objects are passed into controllers methods. They are both wrapped by frameworks helper functions. You can read about that [here](Http.md).

## Handling errors
First argument of both [`this.json`](Controllers.md?id=json) and [`this.render`](Controllers.md?id=render) is error which you can pass as object literal or `new Error`.
You can pass message and statusCode.

```js
this.json({
    message: data.lead.error,
    statusCode: 422
}, err);
```

## API

### render
Function for template rendering. If template matches controller name, you don't have to pass it.

```js
class DetailController extends Rhema.Controller {
    getAction (req, res) {
        this.render(null, { message: 'Hello World!' });
    }
}
```

!> This will look for `detail` template inside `app.get('views')`, so make sure to set that when you are creating [Rhema.App](App.md).

In case template doesn't have the same name as controller you can pass it as third parameter.

```js
class DetailController extends Rhema.Controller {
    async getAction (req, res) {
        this.render(null, { message: 'Hello World!' }, 'new-detail-template');
    }
}
```

Second parameter is viewmodel i.e. data that will be passed to the template.

### json
When you want to return json response from the controller, use `this.json` method.

```js
class StatsController extends Rhema.Controller {
    async getAction (req, res) {
        try {
            const data = await this.model.fetch(req.params);
            this.json(null, data);
        } catch (e) {
            this.json({ message: 'Error fetching the data.' }, null);
        }
    }
}
```

### forward
In case you want to forward request to other controller without redirect, you can use forward for that.

```js
this.forward('Compare:diffAction', { vin: data.vin });
```

`Compare` represents name of the controller where we want to forward request, and `diffAction` is controller method. Second argument are params that will be added to `req.params`.

!> If you don't specify method, `getAction` of given controller will be executed.

### model
If there is a model with the same name as controller, it will be automatically available through `this.model`.

```js
class DetailController extends Rhema.Controller {
    async getAction (req, res) {
        // this.model points to DetailModel
        const data = await this.model.fetch(req.params);
        this.render({}, data);
    }
}
```

### getModel
In case we want to access model with different name than controller, we can use `this.getModel` method.

```js
class DetailController extends Rhema.Controller {
    async storeAction (req, res) {
        const data = await this.getModel('lead').post(req.params);
        this.forward('Detail:getAction', data);
    }
}
```
