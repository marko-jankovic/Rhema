# Middlewares

Middleware provide a convenient mechanism for filtering HTTP requests entering your application.

Middleware functions can perform the following tasks:
- Execute any code.
- Make changes to the request and the response objects.
- End the request-response cycle.
- Call the next middleware function in the stack.

If the current middleware function does not end the request-response cycle, it must call `next()` to pass control to the next middleware function. Otherwise, the request will be left hanging.

## Types
We have five types of middlewares:
- [`allRoutes`](Middlewares.md?id=allroutes)
- [`routerInvoked`](Middlewares.md?id=routerinvoked)
- [`beforeRender`](Middlewares.md?id=beforerender)
- [`afterRender`](Middlewares.md?id=afterrender)
- [`routeError`](Middlewares.md?id=routeerror)

### allRoutes
These are application-level middlewares. Purpose of them is usually caching, security, auth, serving static files etc.
We rearly change or add those since framework setup necesarry ones for us.

Comparing to `routerInvoked` middlewares, `allRoutes` middlewares are bound to `express.app()` instance.

### routerInvoked
Router invoked middlewares are routes specific middlewares which are triggered either on all routes or only on a specific routes.

?> This is the type of middleware that we most often use and write in apps.

Comparing to `allRoutes` middlewares, `routerInvoked` middlewares are bound to `express.Router()` instance.

### beforeRender
Before render middlewares are called just before app renders the template.
They are usefull if you want to modify **data** in last moment before the render.

!> Arguments for `beforeRender` middlewares are different than arguments for other middlewares types.

```js
module.exports = (options) => (data, req, next) => {
    data.example = 'test';
    next(null, data, req);
};
```

### afterRender
After render middlewares are called after app renders the template.
They are usefull if you want to modify **html** in last moment before `res.end`.

!> Arguments for `afterRender` middlewares are different than arguments for other middlewares types.

```js
module.exports = (options) => (data, html, next) => {
    // insert at the and of BODY
    html = utils.string.insert(
        html, html.indexOf('<\/body>'),
        '<!-- Vast -->'
    );

    next(null, data, html);
};
```

### routeError
Error middleware will occure when error happens.
Framework will handle those errors, but if you want to do custom tasks, you can create additional error middlewares.

```js
module.exports = (options) => (req, res, next) => {
    res.status(404).send({
        message: 'Not found!',
        statusCode: 404
    });
};
```

## Dependency injection
Services are injected to middlewares through DI. It works the same way as for the services.
Here is the example of middleware where we inject `$helpers` namespace:

```js
module.exports = (options, $helpers) => (req, res, next) => {
    if (req.query.date) {
        req.query.timestamp = $helpers.timestamp();
    }

    next();
};
```

## Options

### Path

### Routes 

### Env level 

### Disabled 

### Method 

### Protect Arguments

### Options
