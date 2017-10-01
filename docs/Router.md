# Router

Framework router is configuration over convention driven. That means that you don't write code but configs.

Example of `router.yaml`

```yaml
---

search:
  method: GET
  path: "/:vcond?/:make?/:model?/:trim?/:bodystyle?"
  paramsCombination:
    dependencies:
      model: make
      trim: model
  params:
    vcond: "^(New|CPO|Used)"
    make: "^(?!make-|Sedan|Hatchback|Wagon|Coupe|Convertible|Minivan|Pickup|SUV|Van)"
    model: "^(?!model-|Sedan|Hatchback|Wagon|Coupe|Convertible|Minivan|Pickup|SUV|Van)"
    trim: "^(?!trim-|Sedan|Hatchback|Wagon|Coupe|Convertible|Minivan|Pickup|SUV|Van)"
    bodystyle: "^(Sedan|Hatchback|Wagon|Coupe|Convertible|Minivan|Pickup|SUV|Van)"
```

## Options

### Path
This field represents route path where params are defined as *:paramName*. Questionmark should be after param name if param is optional.

### Params Combination
In case you need to support route with shuffled params, use `paramsCombination`.
In subobject `dependencies` we define which param is dependent upon other. By doing that we're avoiding mounting routes that doesn't make sense, like:

```yaml
/cars/:model # dependent on make
/cars/:model/:location # dependent on make
/cars/:model/:bodystyle # dependent on make
```

### Handler
In handler field we define [Controller](Controllers.md) which would be triggered. This is often unnecesarry because of [controller matching](Router?id=controller-matching).
But in case you want to point to specific method use handler in this format:

```yaml
---

about:
  method: GET
  path: "/about"
  handler: "Pages:aboutAction"

contact:
  method: GET
  path: "/contact"
  handler: "Pages:contactAction"
```

### Params
Params object let us define regex for matching params.

### Method
You can use one of the following HTTP methods:
- delete
- get
- post
- put
- methods
- checkout
- copy
- head
- lock
- merge
- mkactivity
- mkcol
- move
- m-search
- notify
- options
- patch
- purge
- report
- search
- subscribe
- trace
- unlock
- unsubscribe

### Timeout
Time after which framework will return `Request Timeout`. Defaults to 30 seconds. Read more about this in [requestTimeout](Built-in-Middleware-Functions.md) built-in middleware.

## Auto match

### Controller matching
Router is smart enough to match route name with controller if you don't define handler. Because of that, handler is often unnecessary.

```yaml
---

home:
  path: "/"
```

Home route will point to `homeController`.

### Method matching
HTTP methods are bound to controller methods:

> httpMethod + 'Action' = controller method

By that formula, `GET` method will point to `getAction`. This is true for all methods except `post`, `put` and `delete` which points to `storeAction`, `updateAction` and `destroyAction`.

## JSON routes
Each route can return `json` response if you either append `.json` on route path or if you send `Content-Type` header with value `application/json`.

- `/vehicles/BMW?location=11211` will return HTML.
- `/vehicles/BMW.json?location=11211` will return JSON.

## Predefined routes
Framework provides some routes by default that are usefull for app monitoring and debug.

| path                               | params                                               | description                                             |
| ---------------------------------- | ---------------------------------------------------- | ------------------------------------------------------- |
| `/core/cache/:category-:type`      | category = service namespace and type = service name | Json route with content of service's *$cache* property.   |
| `/core/status`                     | /                                                    | Info about memory, cpu, process, global vars, etc.      |
| `/core/syslog-errors`              | /                                                    | Aggregate syslog errors by count.                       |
| `/clientSideError`                 | /                                                    | Aggregate client-side errors passed by framework.       |
