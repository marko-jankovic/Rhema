## [Router](https://stash.vast.com/projects/EXPRESSO/repos/rhema/browse/lib/dispatcher/index.js)

###### Wrapper around Express Router with configuration pattern for declaring routes settings such as route paths, route params, controller name and controller action.

### Usage
###### Router configuration **requires** valid route `path`, `params` regex definition (if params are specified in path), and `controller` module that should be placed at `controllers` paths defined in config `app.controllers.paths` array, with `Controller` suffix (e.g. SearchController).
---
### Options
- **`settings`**
    - **`formats`**: (Default: `true`) - Allows adding format/extension at the end of url, e.g. /cars/Acura-CL.json, and in combination with "formats" middleware we have propper content type and json response without creating additional json route or changing controller action. It will add `.:format?` param to route path.
    
    - **`mountPaths`**: (Default: `false`) - Array of subpath prefixes that will point to the same route, controllers and actions. Note that you will have to add default prefix "/".
        
        **Examples**:
        ```
        // mounted paths "/detail/2012", "/cars/detail/2012", "/mobile/detail/2012"
        // will point to detailController::getAction
        "router": {
            "settings": {
                "mountPaths": ["/", "/cars", "/mobile"]
            },
            "routes": {
                "detail": {
                    "method": "GET",
                    "path": "/detail/:year",
                    "params": {
                        "year": "(^\\d{4}$)"
                    }
                }
            }
        }
        ```
    - **`expressRouter`**
        - **`caseSensitive`**: (Default: `false`) - Enable case sensitivity. e.g "/Cars" and "/cars" treat as the same urls.
        
        - **`mergeParams`**: (Default: `false`) - Preserve the req.params values from the parent router. If the parent and the child have conflicting param names, the child’s value take precedence.
        
        - **`strict`**: (Default: `false`) - Enable strict routing. "/cars" and "/cars/" treat as the same url.
        
-  **`routes`**
    - **`method`**: (Default: `GET`) - HTTP method of the request, such as GET, PUT, POST. Express supports the following routing methods corresponding to the HTTP methods of the same names: "checkout", "copy", "delete", "get", "head", "lock", "merge", "mkactivity", "mkcol", "move", "m-search", "notify", "options", "patch", "post", "purge", "put", "report", "search", "subscribe", "trace", "unlock", "unsubscribe". If method is not valid it, Router will use Default.

    - **`methods`**: - Like `method`, it defines HTTP methods on one route path.  **Note** that won't work with `method` and Vise Versa
        ```
        // you can use the same controller and action to create or delete user
        "user": {
            "methods": ["POST", "DELETE"],
            "path": "/user"
        },
        ```
    
    - **`path`**: (**`Required`**) - Path specific for the URI. It should have named REST params. Query params are not specified here.
        
        **Examples**:
        ```
        "login": {
            "method": "POST",
            "path": "/user-login"
        },
        ```
        Path with "action" parameter
        ```
        // Express default style
        "detail": {
            "method": "GET",
            "path": "/user/:delete"
        },
        // curly brackets if you prefer
        "search": {
            "method": "GET",
            "path": "/user/{edit}    
        }
        ```
        "optional" params
        ```
        "search": {
            "method": "GET",
            "path": "/cars/:SRPmake?/:SRPmodel?/:SRPlocation?/:SRPtype?"
        }
        ```
        hyphen and params
        ```
        "detail": {
            "method": "GET",
            "path": "/detail/:VDPyear-:VDPmake-:VDPmodel-:VDPlocation"
        }
        ```
    - **`params`** - A list of params that are valid for route path. They are validated using the regex during Request with Express Router method (`router.param`). If params are not valid, route is not valid and Response will ends with 404 status code.
    
    - **`handler`** - When we need different route paths to point on the same Controller Action or on the same Controller but different Action
        
        **Examples**:
        ```
        // Different route paths points to DetailController::getAction
        "vinDetail": {
            "method": "GET",
            "handler": "Detail",
            "path": "/detail/feed/:vehicleVin",
            "params": {
                "vehicleVin": "([A-Z0-9]{17})"
            }
        },
        "deepLink": {
            "method": "GET",
            "handler": "Detail",
            "path": "/detail/inventory/:vehicleVin",
            "params": {
                "vehicleVin": "([A-Z0-9]{17})"
            }
        }
        ```
        ```
        // Different route paths points to the same StaticPagesController
        // but different actions ourDataAction and ourTeamAction
        "ourData": {
            "method": "GET",
            "handler": "StaticPages:OurData",
            "path": "/our-data"
        },
        "ourTeam": {
            "method": "GET",
            "handler": "StaticPages:OurTeam",
            "path": "/our-team"
        }
        ```
    
    - **`mount`**: (Default: `true`) - If `mountPaths` is set, it is possible to disable it on specific route.
    
        **Examples**:
        ```
        "mountPaths": ["/", "/cars", "/mobile"]
        .
        .
        // "/user/{edit}"
        // "/cars/user/{edit}
        // "/mobile/user/{edit}
        "search": {
            "method": "GET",
            "path": "/user/{edit}    
        },
        // "/detail/:VDPyear-:VDPmake-:VDPmodel-:VDPlocation"
        "detail": {
            "method": "GET",
            "mount": false,
            "path": "/detail/:VDPyear-:VDPmake-:VDPmodel-:VDPlocation"
        }
        ```
    
    - **`enabled`**: (Default: `true`) - if false the route will be ignored by the router.
    
    - **`rearrangeParams`**: (Default: `false`) - Redirect paths, created by `permutation` formula applied to path params, to original `main` route path. Permutation method will be applied to all path parameters, if it is set to `true`, or just to specific array of parameters. **Note** that is not supposed to work in combination with `paramsCombination` and Vise Versa.
    
        **Examples**:
        ```
        // paths that will be redirected to "main path":
        //  - '/cars/:SRPmake/:SRPlocation/:SRPmodel',
        //  - '/cars/:SRPmodel/:SRPmake/:SRPlocation',
        //  - '/cars/:SRPmodel/:SRPlocation/:SRPmake',
        //  - '/cars/:SRPlocation/:SRPmake/:SRPmodel',
        //  - '/cars/:SRPlocation/:SRPmodel/:SRPmake'
        "search": {
            "method": "GET",
            "path": "/cars/:SRPmake/:SRPmodel/:SRPlocation",
            "rearrangeParams": true,
            "params": {
                "SRPmake": "make-(([A-Za-z0-9](_)?)+)",
                "SRPmodel": "model-(([0-9A-Za-z](_)?)+)",
                "SRPlocation": "location-(.*)"
            }
        }
        ```
        
        ```
        // paths that will be redirected to "main path":
        //  - '/cars/:SRPmake/:SRPtype/:SRPlocation/:SRPmodel',
        //  - '/cars/:SRPmodel/:SRPmake/:SRPlocation/:SRPtype',
        //  - '/cars/:SRPmodel/:SRPtype/:SRPlocation/:SRPmake',
        //  - '/cars/:SRPtype/:SRPmake/:SRPlocation/:SRPmodel',
        //  - '/cars/:SRPtype/:SRPmodel/:SRPlocation/:SRPmake'
        "search": {
            "method": "GET",
            "path": "/cars/:SRPmake/:SRPmodel/:SRPlocation/:SRPtype",
            "rearrangeParams": ["SRPmake", "SRPmodel", "SRPtype"],
            "params": {
                "SRPmake": "make-(([A-Za-z0-9](_)?)+)",
                "SRPmodel": "model-(([0-9A-Za-z](_)?)+)",
                "SRPlocation": "location-(.*)",
                "SRPtype": "type-(.*)"
            }
        }
        ```
    
    - **`paramsCombination`** (Default: `false`) - Create and set Router paths, created by `combination permutation` formula applied to path params. It will create all possible paths started from combination of single params, if it is `true`, or it will exclude all paths that doesn't match `dependencies` params relation. **Note** that is not supposed to work in combination with `rearrangeParams` and Vise Versa
        
        **Examples**:
        ```
        // All combinaton of routes will point to the same Controller
        //  - '/cars/:SRPmake',
        //  - '/cars/:SRPmodel',
        //  - '/cars/:SRPlocation',
        //  - '/cars/:SRPmake/:SRPmodel',
        //  - '/cars/:SRPmodel/:SRPmake',
        //  - '/cars/:SRPmake/:SRPlocation',
        //  - '/cars/:SRPlocation/:SRPmake',
        //  - '/cars/:SRPmodel/:SRPlocation',
        //  - '/cars/:SRPlocation/:SRPmodel',
        //  - '/cars/:SRPmake/:SRPmodel/:SRPlocation',
        //  - '/cars/:SRPmake/:SRPlocation/:SRPmodel',
        //  - '/cars/:SRPmodel/:SRPmake/:SRPlocation',
        //  - '/cars/:SRPmodel/:SRPlocation/:SRPmake',
        //  - '/cars/:SRPlocation/:SRPmake/:SRPmodel',
        //  - '/cars/:SRPlocation/:SRPmodel/:SRPmake'
        "search": {
            "method": "GET",
            "path": "/cars/:SRPmake/:SRPmodel/:SRPlocation",
            "paramsCombination": true,
            "params": {
                "SRPmake": "make-(([A-Za-z0-9](_)?)+)",
                "SRPmodel": "model-(([0-9A-Za-z](_)?)+)",
                "SRPlocation": "location-(.*)"
            }
        }
        ```
        ```
        // All combinaton of routes will point to the same Controller
        //  - '/cars/:SRPmake',
        //  - '/cars/:SRPmake/:SRPmodel',
        //  - '/cars/:SRPmodel/:SRPmake',
        //  - '/cars/:SRPmake/:SRPmodel/:SRPlocation',
        //  - '/cars/:SRPmake/:SRPlocation/:SRPmodel',
        //  - '/cars/:SRPmodel/:SRPmake/:SRPlocation',
        //  - '/cars/:SRPmodel/:SRPlocation/:SRPmake',
        //  - '/cars/:SRPlocation/:SRPmake/:SRPmodel',
        //  - '/cars/:SRPlocation/:SRPmodel/:SRPmake'
        "search": {
            "method": "GET",
            "path": "/cars/:SRPmake/:SRPmodel/:SRPlocation",
            "paramsCombination": {
                "dependencies": {
                    "SRPmodel": "SRPmake",
                    "SRPlocation": "SRPmodel"
                }
            },
            "params": {
                "SRPmake": "make-(([A-Za-z0-9](_)?)+)",
                "SRPmodel": "model-(([0-9A-Za-z](_)?)+)",
                "SRPlocation": "location-(.*)"
            }
        }
        ```