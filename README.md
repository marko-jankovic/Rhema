# Rhema Framework

This repo contains the core modules for the Rhema framework. You should checkout the source code or the [API docs](https://engwiki.vast.com/display/FRONTEND/EXPRESSO).

<img src="https://engwiki.vast.com/download/thumbnails/22588416/logo@1x.png?version=1&modificationDate=1502209925864&api=v2" width="200px" align="right" hspace="30px" vspace="140px">

## What's in the box?

This repo contains following modules.

### Core
1. App
2. Callback pipeline
3. Cluster
4. Config
5. Controller
6. Dependency Injection
9. Dispatcher (router)
10. Hooks (interceptors)
11. http (req and res wrappers)
12. Latency
13. Loader
14. Logger
15. Metrics
16. Middleware
17. Model
18. Profiler
19. Registry
20. Server
21. Services
22. Timer
23. Utils

### Plugins
1. apiCall
3. Beatle
2. Git
4. OS

## Node/OS Target

This repo/branch is supposed to run fine on all major OS platforms and targets `Node.js >=6.0`

## Development
Make sure you write tests for all the changes/bug fixes.
Run the following command to see list of available npm scripts.

```
npm run
```

### Eslint
All files are linted via Eslint. Configuration for the Eslint is available on [github](https://github.com/vast-engineering/eslint-config-vast).

### Tests
We are using mocha and chai for unit testing.
To run all tests run `npm run test`.

### Pre-commit
You won't be able to commit your changes if npm throws linting errors or if tests fails.
