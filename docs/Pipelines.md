# Pipelines

Pipeline is the feature of the framework which you can use to execute multiple **asynchronous** tasks.
Main advantage of pipeline comparing to promises, is combination of serial and parallel execution and error handling.
Pipelines are usually used alongside with the Model, where we can meet complex queue order execution.

To make a complete Model representation usually we need to call a few external APIs, and from all the results make a complete `viewmodel`. Some of the API calls can be called in parallel, but some of them may require some previous data fetched. To do so, we can mark tasks to run in parallel or in series.

Pipelines are separated into namespaces (for example: `detail` or `search`) where each namespace represents array of tasks.
Tasks are executed in series by default (one after another), but when you wrap tasks with additional array, those tasks will be executed in parallel, but in series with others.

## Configuring Pipelines

```yaml
---

detail:
  options:
    similarsLimit: 12
  pipes:
  - listingPipe
  - nextListing
  - similarsPipe
search:
  pipes:
  - - listingsPipe
    - attributesPipe
  - facetsFormatPipe
```

In the example above, for the **search** namespace, we have two serial tasks. The first one is group of two parallel tasks (`listingsPipe` and `attributesPipe`), and the second `facetsFormatPipe` is called after both of previous two are completed.
For **detail** namespace, we have just 3 serial tasks, which will run one after another.

## Pipes location
Pipes (javascript files) we are calling inside pipeline should be placed in
`pipelines_path`/`namespace`/`task_name`

- `pipelines_path` is defined in `config.app.pipelines.paths` (usually placed in `configs/app.yaml` file)
- `namespace` is local namespace, for example in listing above **detail** or **search**
- `task_name` is name of the module we call, for example in listing above **similarsPipe** or **listingsPipe**

## Pipe definition
```js
'use strict';

module.exports = (options, $gateway) => (data, next) {
    if (data.shouldIFetchCurrentTime) {
        $gateway.currentTime.fetch((err, response) => {
            !err && data.currentTime = response.currentTime;
            next(err, data);
        });
    } else {
        next(null, data);
    }
};
```

In this example have attached `currentTime` to `data`, and `data.currentTime` will be avaliable in the next pipe following the order of execution.
This will happen only if the flag `data.shouldIFetchCurrentTime` is set to true, which means that we can use if statement to conditionally execute pipe.

### Options
Options is object that will be passed to each pipe. In the config example above `similarsLimit: 12` is passed to each detail pipe.

### Dependency injection
Services are injected to pipes as arguments after `options` object.

### next()
`next` function will be passed to each pipe beside `data`. It works the same way as `next` function in middleware functions.
Each pipe **must** call `next` function (calling next pipe). Arguments are `error` and `data` which will be passed to next pipe.

### Error handling
If you pass error inside `next` function, framework will stop with pipeline execution. In the final callback you will get error which you can handle.

## Using the pipeline
Currently you can call pipelines only from models. They are available through `this`.

```js
class SearchModel extends Rhema.Model {
    async fetch (params) {
        return new Promise((resolve, reject) => {
            this.pipeline({ params }, (err, data) => {
                err ? resolve(data) : reject(err);
            });
        });
    }
}
```

!> By default framework will call pipeline with the same name as model, in example above that would be `search` pipeline. You can call other pipeline by passing the name as first argument.
