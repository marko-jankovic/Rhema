'use strict';

const defaults = {
    NODE_ENV: 'development',
    PORT: '8080',
    HOST: '127.0.0.1',
    NAME: 'main'
};

module.exports = {
    // check ENV type in process.env.NODE_ENV
    is (type) {
        if (Array.isArray(type)) {
            return type.includes(process.env.NODE_ENV);
        } else {
            return process.env.NODE_ENV === type;
        }
    },

    // getter for process.env
    get (type) {
        if (!process.env[type]) {
            this.set(type);
        }

        return process.env[type];
    },

    // setter to process.env
    set (type, value) {
        process.env[type] = value || process.env[type] || defaults[type] || null;
    },

    // 'dev', 'develop', 'development' ENV
    // on local machines it will be undefined initialy
    isLocal () {
        return this.is([undefined, 'dev', 'develop', 'development']);
    },

    isDev () {
        return this.isLocal();
    },

    // alpha ENV
    isAlpha () {
        return this.is('alpha');
    },

    // beta ENV
    isBeta () {
        return this.is('beta');
    },

    // production or prod ENV
    isProd () {
        return this.is(['production', 'prod']);
    },

    // check is allowed env
    // with envRoles env config owervrites are (not necessary || redundant)
    isAllowedEnv (moduleEnv) {
        const env = moduleEnv || 'dev-prod';
        let roleIndex = false;
        const envRoles = {
            dev: ['dev', 'develop', 'development'],
            '!dev': ['alpha', 'beta', 'prod', 'production'],
            '>dev': ['alpha', 'beta', 'prod', 'production'],
            'dev-alpha': ['dev', 'develop', 'development', 'alpha'],
            'dev-beta': ['dev', 'develop', 'development', 'alpha', 'beta'],
            'dev-prod': ['dev', 'develop', 'development', 'alpha', 'beta', 'production', 'prod'],
            alpha: ['alpha'],
            '!alpha': ['dev', 'develop', 'development', 'beta', 'prod', 'production'],
            '>alpha': ['beta', 'prod', 'production'],
            '<alpha': ['dev', 'develop', 'development'],
            'alpha-beta': ['alpha', 'beta'],
            'alpha-prod': ['alpha', 'beta', 'production', 'prod'],
            beta: ['beta'],
            '!beta': ['dev', 'develop', 'development', 'alpha', 'production', 'prod'],
            '>beta': ['production', 'prod'],
            '<beta': ['dev', 'develop', 'development', 'alpha'],
            'beta-prod': ['beta', 'production', 'prod'],
            prod: ['production', 'prod'],
            '!prod': ['dev', 'develop', 'development', 'alpha', 'beta'],
            '<prod': ['dev', 'develop', 'development', 'alpha', 'beta']
        };

        envRoles[env].forEach((role) => {
            if (role.indexOf(this.get('NODE_ENV')) !== -1) {
                roleIndex = true;
            }
        });

        return roleIndex;
    },

    // check is module active based on {envLevel} and
    // {enabled} flag from module options
    isActive (config) {
        if (config) {
            const allowedEnv = this.isAllowedEnv(config.envLevel);
            if (!allowedEnv || config.enabled === false || config.disabled) {
                return false;
            } else {
                return true;
            }
        }

        return false;
    }
};
