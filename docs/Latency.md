# Latency

Framework will measure execution time for each pipe, middleware function and service. That module inside framework is called latency.

Latency will not work in local env by default, but you can override it through the config.

```yaml
---

framework:
  latency:
    envLevel: "!dev"
    ignore: []
```

!> `!dev` is env utils specific feature. Read more about it [here](Utils.md).

In `ignore` array you can add names of the services that you don't want to measure.

In the background, latency module is using [Timer](Timer.md).
