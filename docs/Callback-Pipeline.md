## [Callback-Pipeline](https://stash.vast.com/projects/EXPRESSO/repos/rhema/browse/lib/callback-pipelne/index.js)
######
---

Flow pipeline that allows executing pipes (chunks of code) in series, in parallel or combined. Allows retrying<sup>[1](#retry-option)</sup> execution of a single pipe a couple of times (using [async.retry](https://github.com/caolan/async#retry)) which might prove useful for API calls and other tasks that include network operations.


Completely customizable through configuration, pipeline will accept either a string or an object as a pipe configuration:

```json
"pipes": [
    "shared/sharedPipe",
    "singlePipe"
]
```

or

```json
"pipes": [
    {
        "name": "shared/sharedPipe"
    },
    {
        "name": "singlePipe"
    }
]
```

The latter method is useful when combined with "retry" option:

```json
"pipes": [
    {
        "name": "shared/sharedPipe",
        "retries": 3
    }
]
```

> Names of the pipes passed through configuration will resolve to file paths. Pipeline will require the file and prepare it for execution. Paths from which pipes can be required are defined in general pipeline config:

```json
"options": {
    "paths": [
            "./app/models/pipelines", 
            "./second/path", 
            "/third/path"
        ]
}
```
> Priority for pipe loading is defined by order of paths inside an array under "paths". If pipe file is not found in path contained in first element of an array, script will try to load id from the next one and so on. In this example, script will first look for pipe in "./app/models/pipelines", then in "./second/path" and finally, if file was not present in any of these paths, it will try loading it from "/third/path". Finally, pipe name and pipe filename are being appended to require() path.
> 
> By default, pipeline name is appended to loading path so, in "search" pipeline, pipe "series1" will resolve to "./search/series1". If pipe name contains '/' (i.e. "shared/sharedPipe"), path to the pipe will take it into consideration so you can for instance call "shared/sharedPipe" from search pipeline and that pipe will be loaded from "shared" subdirectory, not from "search" subdirectory<sup>[2](#pipeline-paths)</sup>.

So far, all these pipes would get executed in series. However, it is possible to execute them in parallel or even combine series and parallel execution by passing an array in configuration. All pipes that are contained in an array will be executed in parallel.

```json
"pipes": [
    [
        "singlePipe",
        "shared/sharedPipe"
    ]
]
```
In this case, singlePipe and shared/sharedPipe are being executed in parallel. Both are getting "data" object passed by previous pipe and callback. The object is passed by reference, so both pipes can use it at once. Once all parallel pipes are executed, next pipe in series will be called with same "data" object and callback as parameters.

It is possible to combine parallel/series and retry parameter to achieve maximum flexibility:

```json
"parallel-test": {
    "pipes": [
        "series1",
        { "name": "retry1", "retries": 5 },
        [
            "series-parallel1",
            [
                "parallel1",
                { "name": "retry2", "retries": 5 }
            ],
            [
                "parallel2",
                "parallel3"
            ]
        ],
        {
            "name": "series2"
        }
    ]
}
```

Execution order for this example:

1. "series1"
2. "retry1" (max. three retries) <sup>[1](#retry-option)</sup>
3. parallel execution of the following:
 - series-parallel1
 - parallel execution of the following
     - "parallel1"
     - "retry2" (max 5 retries)<sup>[1](#retry-option)</sup>
- parallel execution of the following:
    - "parallel2"
    - "parallel3"
4. "series2"

In step 2. from this example, pipe has access to data passed by previous serial pipe ("series1"). Parallel pipes in step 3 can receive both data from step 1 and step 2 ("retry1") while internal parallel pipes (after "series-parallel1") will have access to results from step 1 and 2 as well as reuslts from "series-parallel1".

Another example:

```json
"simple-series-parallel-test": {
    "pipes": [
        "series1",
        [
            "parallel1",
            "parallel2",
            "parallel3"
        ],
        "series2"
    ]
}
```

----------

__<a name="retry-option"></a><sup>1</sup>__ &nbsp; _If pipe that has retry option fails (returns an error), it will be called again n times where 'n' is less than or equal to value of "retries" option. If it passes (returns no errors), no subsequent calls to this pipe are made, and pipeline moves on to the next one._

__<a name="pipeline-paths"></a><sup>2</sup>__ &nbsp; _When loading "series1" from the example, pipeline will try to load it from one of the paths from config + pipeline name "./app/models/pipelines/search/" if there's no '/' in pipe name. If slash '/' is present (i.e. "shared/sharedPipe", pipe "sharedPipe.js" will be loaded from "./app/models/pipelines/shared"._


