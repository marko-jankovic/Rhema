'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const basename = path.basename;
const extname = path.extname;
const utils = require('@rhema/utils');

// Flexible and environment aware configuration loader,
// recursively read a directory path's contents and merge
// them synchronously info one JSON object.
class Config {
    constructor (options, baseConfig) {
        // returns generated config with applied env
        this.build = function () {
            // merge default config with options
            this.options = utils.object.deepMerge({
                rootPath: './configs',
                followDirNames: true,
                followFileNames: true,
                toBoolean: true,
                template: true,
                envDir: 'env',
                testConfig: false,
                subdomainDir: null,
                ignore: [
                    '.DS_Store',
                    '.git'
                ],
                extension: '*'
            }, options || {});

            this.baseConfig = baseConfig || {};

            return this.createConfig(this.options);
        };
    }

    // load config from folders
    // transform configs to json
    // create subdomains overrides based on subdomain path
    // normalize data (toBoolean, micro templates, etc.) based on options
    // apply environment overrides
    createConfig (options) {
        let config = {};

        // create "apps" namespace
        config.apps = {};

        // create name of subdomain folder
        const subdomainsDir = basename(options.subdomainDir || '');
        // get env dir
        const envDir = basename(options.envDir);

        // sync reading all folders from rootPath
        config.apps.main = options.rootPath ? (this.loadConfigSync() || {}) : {};

        // main config will overwrite baseConfig fields
        config.apps.main = utils.object.immutableDeepMerge(this.baseConfig, config.apps.main);

        // flag just for unit tests
        if (options.testConfig) {
            config.apps.main = utils.object.immutableDeepMerge(config.apps.main, options.testConfig);
        }

        // merge env config with main
        config.apps.main = this.mergeEnvConfig(config.apps.main);

        // if we have subdomains add each subdomain to "apps" and delete subdomains object from main
        if (subdomainsDir && config.apps.main[subdomainsDir]) {
            Object.assign(config.apps, this.createSubdomainsConfig(config.apps.main, subdomainsDir));
            delete config.apps.main[subdomainsDir];
        }

        // delete env object from main
        delete config.apps.main[envDir];

        // enable config templating
        if (options.template) {
            config = this.applyMicroTemplate(config);
        }

        if (options.toBoolean) {
            config = this.transformData(config);
        }

        return config;
    }

    // deep merge main and each subdomain object
    // override with env config
    // return subodomains objects
    createSubdomainsConfig (mainConfig, subdomainsDir) {
        // make clone of main object
        const config = _.clone(mainConfig, true);
        // find subdomains config inside main object
        const subdomainConfig = config[subdomainsDir];
        const envDir = basename(this.options.envDir);

        // go through subdomains object
        _.each(subdomainConfig, (object, cobrand) => {
            // merge current subdomain (cobrand) and main
            subdomainConfig[cobrand] = utils.object.immutableDeepMerge(config, subdomainConfig[cobrand]);

            // override with env config just in case we have cobrand specific env override
            subdomainConfig[cobrand] = this.mergeEnvConfig(subdomainConfig[cobrand]);

            // delete original subdomain object from main
            delete subdomainConfig[cobrand][subdomainsDir];
            // delete env object from subdomain object
            delete subdomainConfig[cobrand][envDir];
        });

        return subdomainConfig;
    }

    // configuration files are applied and overridden according to the current environment
    // merge env config with apps
    // delete original env config from main
    // return merged
    mergeEnvConfig (config) {
        // get folder name with env configs
        const envDir = basename(this.options.envDir);
        // get env from process
        const env = utils.env.get('NODE_ENV');

        if (!utils.env.isLocal() && config[envDir]) {
            const envConfig = config[envDir][env];

            // if env (from process) exist in main, merge it with current app
            if (typeof envConfig !== 'undefined') {
                config = utils.object.deepMerge(config, envConfig);
            } else {
                // prevent starting app if process env is not defined in config
                throw new Error(`ENV ${env} is not defined`);
            }
        }

        // return merged config
        return config;
    }

    // recursivly sync reading files from rootPath
    // checking for valid formats
    // create main object
    loadConfigSync () {
        // create namespace
        const paths = {};
        // shortcut
        const options = this.options;

        const readDirSync = (currentPath, filetree) => {
            // get file and folder names from config root path
            const files = utils.fs.readdirSync(currentPath);

            // check if there is file and sub-folder
            // with the same basename in the {currentPath} folder
            let rootMatched = files.map((item) => {
                return path.parse(item).name;
            }).some((el, index, arr) => {
                return arr.filter(x => x === el).length > 1;
            });

            // go through each file/folder name
            _.each(files, (file) => {
                // create path for file/folder
                const currentFile = path.join(currentPath, file);
                // stats for checking type of currentFile
                const stats = fs.statSync(currentFile);
                // check for ignore files from config
                const isValidFile = !options.ignore.includes(file);

                // if current item is folder, read through it
                if (stats && stats.isDirectory() && isValidFile) {
                    // keep reading subdirectories recursively
                    if (options.followDirNames) {
                        filetree[file] = {};
                        readDirSync(currentFile, filetree[file]);
                    } else {
                        readDirSync(currentFile, filetree);
                    }
                } else if (stats && stats.isFile() && isValidFile) {
                    const fileExt = extname(currentFile);
                    const fileName = basename(currentFile, fileExt);
                    const isValidExtension = utils.app.isValidExtension(options.extension, fileExt);
                    const fileFullPath = utils.fs.resolve(currentFile);
                    // double checking for valid dynamic created paths
                    const fileExist = utils.fs.fileExistsSync(fileFullPath) ? true : false;

                    // file is valid and parent object exists
                    if (fileExist && isValidExtension) {
                        // create objects from dir name
                        if (options.followDirNames && !rootMatched) {
                            if (options.followFileNames) {
                                // create namespace based on file name
                                filetree[fileName] = utils.json.loadToJson(fileFullPath);
                            } else {
                                // add to parent namespace
                                Object.assign(filetree, utils.json.loadToJson(fileFullPath));
                            }
                        } else {
                            const obj = utils.json.loadToJson(fileFullPath);

                            if (!obj[fileName] && rootMatched) {
                                filetree = utils.object.deepMerge(filetree, { [fileName]: obj });
                            } else {
                                filetree = utils.object.deepMerge(filetree, obj);
                            }
                        }
                    } else if (options.followFileNames && rootMatched) {
                        const obj = utils.json.loadToJson(fileFullPath);

                        // add to main object
                        if (!obj[fileName]) {
                            filetree = utils.object.deepMerge(filetree, { [fileName]: obj });
                        } else {
                            filetree = utils.object.deepMerge(filetree, obj);
                        }
                    } else {
                        // add to main object
                        filetree = utils.object.deepMerge(filetree, utils.json.loadToJson(fileFullPath));
                    }
                }
            });
        };

        // start recursively reading from rootPath
        readDirSync(options.rootPath, paths);

        return paths;
    }

    // normalize data according to rules
    transformData (data) {
        _.each(data, (value, key) => {
            if (_.isObject(value)) {
                this.transformData(value);
            } else if (value) {
                data[key] = utils.string.toBoolean(value);
            }
        });

        return data;
    }

    // enable templating config to avoid repating values
    // example: apikey, apiurl, etc.
    applyMicroTemplate (config) {
        const template = (siteConfig) => {
            // template regex
            const regExp = /\{%(.+?)%\}/igm;
            let stringifyConfig = typeof (siteConfig) !== 'string' ? utils.json.safeStringify(siteConfig) : siteConfig;
            // match all template values
            const regArray = stringifyConfig.match(regExp);

            regArray.forEach((regValue) => {
                // get value inside template
                // e.g. {{% defaults.name %}} => defaults.name
                const repValue = (regValue.match(/\{%(.*)%\}/).pop()).trim();

                // template helpers must be in {% value | helper %} definition
                if (repValue.includes('|')) {
                    const helperDef = repValue.split('|');
                    const transformValue = utils.string.removeMultipleWhitespace(helperDef[0]);
                    const helper = utils.string.removeWhiteSpace(helperDef[1]);

                    // helper is method defined inside Config
                    if (utils.app[helper] && typeof utils.app[helper] === 'function') {
                        const transformed = utils.app[helper](transformValue);

                        if (typeof transformed === 'number') {
                            // replace template string with number
                            stringifyConfig = stringifyConfig.replace(`"${regValue}"`, transformed);
                        } else {
                            stringifyConfig = stringifyConfig.replace(regValue, transformed);
                        }
                    } else {
                        throw new Error(`Unknown template helper: "${helper}"`);
                    }
                } else {
                    // find repValue object in siteConfig
                    let getValue = utils.object.getValue(siteConfig, repValue);

                    if (typeof getValue === 'undefined') {
                        try {
                            getValue = utils.object.getValue(
                                utils.json.safeParse(siteConfig), repValue
                            );
                        } catch (e) {
                            throw new Error(`Unknown template variable: "${repValue}"`);
                        }
                    }

                    // if template string is object or array
                    if (utils.object.isObject(getValue) || Array.isArray(getValue)) {
                        const injectValue = utils.json.safeStringify(getValue);
                        const repRegex = new RegExp(`"${regValue}"`, 'igm');

                        stringifyConfig = stringifyConfig.replace(repRegex, injectValue);
                    } else {
                        stringifyConfig = stringifyConfig.replace(regValue, getValue);
                    }
                }
            });

            // check again
            // there could be template of template
            // "server.name" {{% defaults.name %}}
            // and other configs could have {% server.name %}
            if (regExp.test(stringifyConfig)) {
                return template(stringifyConfig);
            } else {
                return stringifyConfig;
            }
        };

        // config example - {{% defaults.api.url %}}
        // each app - main and subdomain apps
        _.each(config.apps, (siteConfig, name) => {
            config.apps[name] = utils.json.safeParse(template(siteConfig));
        });

        return config;
    }
}

module.exports = Config;
