'use strict';

const cls = require('cls-hooked');
const name = Symbol('namespace');

// cls wrapper
module.exports = {
    get (key) {
        const namespace = this.getNamespace(this[name]);

        if (namespace) {
            return namespace.get(key) || false;
        }

        return false;
    },

    set (key, value) {
        const namespace = this.getNamespace(this[name]);

        if (!namespace) {
            return;
        }

        if (namespace.active) {
            return namespace.set(key, value);
        } else {
            namespace.run(() => {
                namespace.set(key, value);
            });
        }
    },

    createNamespace (namespace) {
        this[name] = namespace;
        return cls.createNamespace(namespace);
    },

    getNamespace (namespace) {
        return cls.getNamespace(namespace);
    },

    run (callback) {
        const namespace = this.getNamespace(this[name]);

        namespace.run(() => {
            callback(namespace);
        });
    }
};
