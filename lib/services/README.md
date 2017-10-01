###Services

####What are Services?

>Services are used for building reusable circularly connected components powered by Dependency Injector. That means that each component can define other components that will be injected as dependency param. Components can be injected and used in every Controller Action, Model, Middleware, Pipeline or it can be executed initialy, at begining of application bootstrap and before server start.      

####Configuring Services
    
>The moment you start application, you already have some available services configured in framework base config, inside of {app.services} object. You have to follow that convention and every additional application service MUST be defined inside of {app.services} object. 
     
```
// example
"app": {
    "services": {
        "helper": {
            "validator": {
                "path": "./app/services/utils.js",
                "method": "getValidator",
                "options": {
                    "whiteList": ["error"]
                }
            },
            "date": {
                "path": "./app/services/utils.js",
                "method": "getDate",
                "options": {
                    "whiteList": ["error"]
                }
            }
        },
        "formatter": {
            "pluralize": {
                "path": "./app/services/pluralize.js"
            }
        },
        "gateway": {
            "cacheData": {
                "refreshTime": 86400000,
                "path": "./app/services/cacheData.js",
                "options": {
                    "apiUrl": "www.example.com/getJson
                }
            }
        }
    }
}
```

- **helper or formatter** - It is just a namespace, you can use whatever you think it is appropriate, based on Service type. Namespace object is MANDATORY, you can't define Service without namespace object. 
    - Recomended namespaces are:
        - "helper" (complex business logic with service "options")
        - "formatter" (very simple logic with input and output e.g. pluralize method)
        - "gateway" (requests to some external APIs).

- **validator** - "validator" is a name of Service. It is recomended to have the same Service name as module name.  

- **`path`** - Service path is required and without "path" application will throw Error Exception.
  
- **`options`** - Options are optional and if it is not defined service will have first argument set as empty object "{}".
 
- **`method`** - Used for creating specific exported method as service.
 
- **`refreshTime`** - Time interval (in miliseconds) after "initialize" method will be triggered again. If it is not defined, "initialize" will be executed only once.     


####Creating and Using Services

>Service MUST be a constructor and it will always have injected "options" as first argument. Other DI arguments are specified with dollar notation (`$helpers` OR `$isPluralized = 'helper.validator.isPluralized'`) and must follow namespaces defined in services config.  

**Examples of Services definition and communication between them**

```
// example 1 "./app/services/utils.js"
// export multiple methods
module.exports = {
    getDate: require(./date),
    getValidator: require(./validator)
}

// "./app/services/date.js"
module.exports = function Date (options, $formatter) {
    this.getMonth = function () {
        const today = new Date();
        return today.getMonth() + 1;
    },
    
    this.getYear = function () {
        const today = new Date();
        return today.getYear();
    }
}

// "./app/services/validator.js"
module.exports = function Validator (options, $formatter) {
    this.isPluralized = function () {
        return $formatter.pluralize('test') === 'tests';
    }
}

// example 2 "./app/services/pluralize.js"
// return anonymous function (Currying)
module.exports = function Pluralize (options) {
    return function (input) {
        return `${input}'s';
    }
}
```

**Services that needs to be executed initialy and/or refreshed after some interval time MUST have defined "initialize" method and triggered "done" callback**

```
// example 3 "./app/services/cacheData.js"
// initialize function triggered before server has been started
module.exports = function CacheData (options) {
    this.$cache = {};

    this.initialize = function (done) {
        // fetch data
        var request = require('request');
        request(options.apiUrl, (error, response, body) => {
            // cache response
            this.$cache = body;
        });
    }
}
```

**Using Services in Middleware**

``` 
module.exports = function PageType (options, $gateway, $isPluralized = 'helper.validator.isPluralized') {
    return function pageType (req, res, next) {
        // we can reach cached data from cacheData gatway
        $isPluralized = $isPluralized();
        res.json($gateway.cacheData.$cache);
    };
};

```

**Using Service in Controller or Model**

```
getAction (req, res, next) {
    const redirectUrl = this.$helpers.rewriter.formatUrl('search', { location: 11211 });
    res.redirect(301, redirectUrl);
}

``` 