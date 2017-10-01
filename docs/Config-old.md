## [Config Loader](https://stash.vast.com/projects/EXPRESSO/repos/rhema/browse/lib/config/index.js)

###### Flexible and environment aware configuration loader, recursively read a directory paths contents and merge them synchronously info one JSON object.
---
### Basic usage
```
var baseConfig = require('./app/baseConfig.json');
var configOptions = {
    rootPath: './app/configs',
    envDir: './env',
    extension: ['.js', '.json']
};
var appConfig = new Config(configOptions, baseConfig);
```


- **baseConfig** - Located in [`./app/baseConfig.json`](https://stash.vast.com/projects/EXPRESSO/repos/rhema/browse/lib/app/baseConfig.json) and contains and defines main Rhema config skeleton with predefined values for all Rhema modules.

- **appConfig** - Contain the configuration object created following `configOptions` and predefined default options set inside Config module. 

- **Config** - Read all folders recursively from `rootPath` directory, read and merge all files that support `extension` into `config.apps.main` object which is merged and overwritten with `baseConfig`. Based on process.env.NODE_ENV, `envDir` files alpha|beta|prod.json are merged and overwritten with `config.apps.main` object.

---
### Options

- `rootPath` - Path to application config. Allows you to create folder, subfolders and files in structure and names you like. (default: "./configs")

- `envDir` - Path to environment configs alpha|beta|prod (default: "./env")

- `ignore` - Ignore list (default: [".DS_Store", ".git"])

- `followDirNames` - Create objects following folder names (default: "true")

```
    // {rootPath}/app/services.json
    {
        "services": {
            "searchApiCall": {
                "apiKey": "{{% defaults.apiKey %}}",
                "name": "{{% app.name %}}-ApiCall"
            }
        }
    }
```

```
    // "followDirNames": false
    // it will ignore folder name
    // {rootPath}/app/services.json
    {
        "app": {
            "services": {
                "searchApiCall": {
                    "apiKey": "{{% defaults.apiKey %}}",
                    "name": "{{% app.name %}}-ApiCall"
                }
            }
        }
    }
```

- `followFileNames` - Create objects following file names. Depends on `followDirNames` (default: "true")

```
    // {rootPath}/app/services.json
    {
        "searchApiCall": {
            "apiKey": "{{% defaults.apiKey %}}",
            "name": "{{% app.name %}}-ApiCall"
        }
    }
```

```
    // "followFileNames": false
    // it will ignore file name
    // {rootPath}/app/services.json
    {
        "app": {
            "services": {
                "searchApiCall": {
                    "apiKey": "{{% defaults.apiKey %}}",
                    "name": "{{% app.name %}}-ApiCall"
                }
            }
        }
    }
```

- `toBoolean` - Transform all types of truthy ("on", "yes", "enable", "enabled", "true", "1") and falsy ("no", "off", "disable", "disabled", "false", "undefined", "null", "NaN", "0") strings to boolean (default: "true")

- `template` - Enable templating inside config. (default: "true")

```
{
    "app": {
        "name": "{{% defaults.name %}}-Server",
        "services": {
            "searchApiCall": {
                "apiKey": "{{% defaults.apiKey %}}",
                "name": "{{% app.name %}}-ApiCall"
            }
        }
    },
    "defaults": {
        "name": "Rhema",
        "apiKey": "84B37739-031E-4262-B9C4"
    }
}
```

- `subdomainDir` - Path to the subdomain directory. (default: "null") 

```
// {rootPath}/app.json
{
    "vhosts": [
        "carfax.test-local.test.com",
        "carfax.test-alpha.test.com",
        "carfax.test-beta.test.com"
    ]
}
```

```
// {rootPath}/api.json
{
    "key": "106158953120415313910615895312041",
    "url": "http://carfaz.vast.com/listings/-/cars"
}
```

```
// {subdomainDir}/adi.json
{
    "app": {
        "vhosts": [
            "adi.test-local.test.com",
            "adi.test-alpha.test.com",
            "adi.test-beta.test.com"
        ]
    },
    "api": {
        "key": "10615895312041531391111111111111",
        "url": "http://adi.vast.com/listings/-/cars"
    }
}
```

```
// config
{
    "apps": {
        "main": {
            "app": {
               "vhosts": [
                    "carfax.test-local.test.com",
                    "carfax.test-alpha.test.com",
                    "carfax.test-beta.test.com"
                ]
            },
            "api": {
                "key": "106158953120415313910615895312041",
                "url": "http://carfaz.vast.com/listings/-/cars"
            }
        },
        "adi": {
            "app": {
                "vhosts": [
                    "adi.test-local.test.com",
                    "adi.test-alpha.test.com",
                    "adi.test-beta.test.com"
                ]
            },
            "api": {
                "key": "10615895312041531391111111111111",
                "url": "http://adi.vast.com/listings/-/cars"
            }
        }
    }
}
```

- `extension` - File extensions that will be transformed to JSON. Supported extensions: ".js", ".json", [".yaml"](https://www.npmjs.com/package/yamljs), [".ini"](https://www.npmjs.com/package/ini) (default: "*")

```
// yaml file
app: 
    name: "{{% defaults.name %}}-Server"
    services: 
        searchApiCall: 
            apiKey: "{{% defaults.apiKey %}}"
            name: "{{% app.name %}}-ApiCall"
defaults: 
    name: "Rhema"
    apiKey: "84B37739-031E-4262-B9C4"
```
```
// ini file
[app]
name = "{{% defaults.name %}}-Server"
services.searchApiCall.apiKey = "{{% defaults.apiKey %}}"
services.searchApiCall.name = "{{% app.name %}}-ApiCall"

[defaults]
name = Rhema
apiKey = 84B37739-031E-4262-B9C4

```

---
### Arrays are merged by replacement

Note that arrays are always merged by replacement, complete contents of an array in child object will replace the complete array from a parent object.

```
// baseConfig vhosts
"app": {
    "vhosts": ["localhost"]
}
```
```
// app config vhosts will replace baseConfig vhosts
"app": {
    "vhosts": [
        "www.carstory.com",
        "carstory.com"
    ]
}
```
---
### Folders and files with same name on the same level

Note that in case you have `app` folder and `app.json`, app.json will be treated as `parent` and all objects created from `app` folder will be merged into it.