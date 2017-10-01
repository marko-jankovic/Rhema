# App

App is main module of framework which connects all parts together. Inside main file (`server.js`) we start the app.

```js
const configSettings = {
    rootPath: './app/configs',
    envDir: './env',
    extension: ['.yaml', '.js', '.json']
};

return new Rhema.App(configSettings, (app, config, services) => {
    app.set('viewmodel', false);
});
```

## Params

### config

This is plain object where we setup several things and paths that app needs to know about.
This is actually passed to [Config component](Config.md).
- `rootPath` - root path of configs
- `envDir` - path for folder with env overrides
- `extension` - allowed extensions for configs

### callback

Callback will be executed upon app start. Params that are passed are:
- `app` - express app instace
- `config` - merged config object
- `services` - services object

## Express app

With express app instance you can do whatever would you do if you would using express.
For example you can setup view engine, add something to locals, etc. You can read about it in [Express docs](https://expressjs.com/en/4x/api.html#app.all).

## Common tasks in app callback
- setup view engine
- adding things to locals
