# Config

Config is very important component of the framework. It permeates throughout every part of framework.
Idea is to have all configs for the app in one place but to separate concerns by using multiple files.

## Options

Options are passed to config component when we start [the app](App.md).

| property               | type                | default                 | description                                         |
| ---------------------- | ------------------- | ----------------------- | --------------------------------------------------- |
| **rootPath**           | *string*            | `"./configs"`           | Path where configs are located.                     |
| **followDirNames**     | *boolean*           | `true`                  | Use folder names as namespace.                      |
| **followFileNames**    | *boolean*           | `true`                  | Use file names as namespace.                        |
| **toBoolean**          | *boolean*           | `true`                  | Cast truthy and falsy values to boolean.            |
| **template**           | *boolean*           | `true`                  | Use templating inside configs.                      |
| **envDir**             | *string*            | `"env"`                 | Path where env overrides are located.               |
| **subdomainDir**       | *string*            | `null`                  | Path where cobrand overrides are located.           |
| **ignore**             | *array*             | `[".DS_Store", ".git"]` | Which files and folder to ignore.                   |
| **extension**          | *array or string*   | `"*"`                   | Which extensions to merge.                          |

## Format
Config supports multiple formats (`json`, `javascript`, `yaml`, `ini`, `xml`), but it's recommended to use `yaml`.

## Structure
You can orgnize config files how every you want, but it's important to follow some namespaces:
- app
- framework
- env
- defaults

This is recommended structure of config files:
```
├── app
│   ├── middlewares.json
│   ├── pipelines.json
│   ├── router.json
│   └── services.json
├── app.json
├── defaults.json
├── env
│   ├── alpha.json
│   ├── beta-qa.json
│   ├── beta-uat.json
│   ├── beta.json
│   └── prod.json
└── framework.json
```

For smaller apps you can have one config file, for example `config.yml` where you would put all configs.

!> Since `followDirNames` and `followFileNames` are true by default, framework will use folder names as namespace, so the content of the `services.yaml` would be:

```yaml
---

helpers:
  pluralize:
    path: "./server/services/pluralize.js"

```

As you can see, helpers are not nested under `app.services` since framework does that for us by using folder names.
 
## Templates and helpers

### Templating
If you need to repeat something through the config, it's good to use templating for that.
Inside `defaults` namespace place things you want to repeat, for example:

```yaml
---

apiUrl: http://api.com
apiKey: 1234
```

and then in your `services.yaml` use it like this:

```yaml
---

gateway:
  cacheData:
    refreshTime: "{% 10 min | toMs %}"
    path: "./app/services/cacheData.js"
    options:
      "apiUrl": "{% defaults.apiUrl %}"
      "apiKey": "{% defaults.apiKey %}"

  searchApi:
    path: "./app/services/searchApi.js"
    options:
      "apiUrl": "{% defaults.apiUrl %}"
      "apiKey": "{% defaults.apiKey %}"
```

### toMs

You can use `toMs` helper to convert time with ease.

Example for services:

```yaml
---

gateway:
  cacheData:
    refreshTime: "{% 10 min | toMs %}"
    path: "./app/services/cacheData.js"
    options:
      "apiUrl": "www.example.com/getJson"
```

Words that are supported:
- for seconds (s, sec, second, seconds)
- for minutes (m, min, minute, minutes)
- for hours (h, hour, hours)
- for days (d, day, days)
