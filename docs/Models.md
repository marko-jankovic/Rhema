# Models

Models are simple classes that you can use to extract business logic from controllers.

## Pipelines
You can execute pipelines in models. They are available through `Rhema.Model`:

```js
class SearchModel extends Rhema.Model {
    fetch (params, callback) {
        this.pipeline({ params }, (err, data) => {
            callback(err, data);
        });
    }
}
```

## Services
Services are injected to models through `Rhema.Model` ie `this`.

```js
class SearchModel extends Rhema.Model {
    async fetch (params) {
        const data = await this.$gateway.api(params);

        return data;
    }
}
```
