# Cluster

Framework does vertical scaling by using [node.js cluster module](https://nodejs.org/api/cluster.html).
Default config is:

```yaml
---
framework:
  cluster:
    envLevel: "!dev"
    workers: 4
    forkDelay: "{% 15 seconds | toMs %}"
    forkThrottle: true
    schedulingPolicy: "SCHED_RR"
    killSignals:
      - SIGINT
      - SIGTERM
      - SIGQUIT
    export: "build/profiler/info.json"
    setupMaster:
      args:
        - "--use"
        - "https"
      silent: true
```

## Environment
By default clustering will not work in local environment. You can turn it on by overriding config or by forcing other env, for example:

```bash
$ NODE_ENV=beta node server
```

In case you want to override it through config:

```yaml
---

framework:
  cluster:
    envLevel: "!beta"
```

!> `!beta` is env utils specific feature. Read more about it [here](Utils.md).

## Workers count
You can define how many workers will framework create through config.

```yaml
---

framework:
  cluster:
    workers: 4
```

!> Default number of workers is 4, but if you unset it, it will use number of machine cores.

## Fork delay
This is time to wait until we fork a new worker. Reason for this is if we're calling API on app start, some API routes maybe can't handle more then 10 calls in parallel (for 10 workers). Default fork delay is 15 sec, but you can override it in config.

```yaml
---

framework:
  cluster:
    forkDelay: "{% 30 seconds | toMs %}"
```

?> If you're interested in `toMs` helper visit [Config docs](Config.md?id=toMs).

## Fork throttle
This flag is set to true by default and it will prevent forking new workers if they start dying infinitely.
Default throttle is 60 sec and it can't be overriden for now.

```yaml
---

framework:
  cluster:
    forkThrottle: false
```

## Policy
With cluster policy you can tell framework when and how to forward requests to workers.
You can read more about it in [official node.js docs](https://nodejs.org/api/cluster.html#cluster_cluster_schedulingpolicy).

Default policy is `SCHED_RR`, i.e. [Round-robin](https://en.wikipedia.org/wiki/Round-robin_scheduling), but you can override it through config.

```yaml
---

framework:
  cluster:
    schedulingPolicy: "SCHED_NONE"
```

## Kill signals
We can define on which process signals we want to kill the worker.
Framework's default kill signals are:
- SIGINT
- SIGTERM
- SIGQUIT 

You can override this through the config:

```yaml
---

framework:
  cluster:
    killSignals:
      - SIGINT
      - SIGTERM
```

## Export
By default framework will export json file with info when workers died or when they are forked.
You can set custom path where file will be created. Default path is `build/profiler/info.json`.

```yaml
---

framework:
  cluster:
    export: "build/workers-info.json"
```

## Setup master
This object will be passed to node.js [`cluster.setupMaster`](https://nodejs.org/api/cluster.html#cluster_cluster_setupmaster_settings), and by default framework passes this:

```yaml
---

framework:
  cluster:
    setupMaster:
      args:
        - "--use"
        - "https"
      silent: true
```
