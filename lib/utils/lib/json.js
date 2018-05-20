'use strict';

const filesystem = require('./filesystem');
const extname = filesystem.getExtName;
const object = require('./object');
const string = require('./string');
const fs = require('fs');

module.exports = {
    // safe json parsing
    safeParse (json) {
        try {
            return JSON.parse(json);
        } catch (e) {
            return null;
        }
    },

    safeStringify (json, replacer, space) {
        try {
            return JSON.stringify(json, replacer, space);
        } catch (e) {
            return '{}';
        }
    },

    updateFileSync (filePath, data, field) {
        const content = {};
        // check if file already exist
        if (filesystem.isFileSync(filePath)) {
            // read file and parse json data
            const fileData = filesystem.readFileSync({ path: filePath });
            const infoData = fileData ? (this.safeParse(fileData) || {}) : {};

            if (!infoData[field]) {
                infoData[field] = {};
            }

            // update if field already exist
            infoData[field] = object.merge(infoData[field], data, false, true);

            // update file
            fs.writeFileSync(filePath, this.safeStringify(infoData));
        } else {
            // create file and add data
            content[field] = data;

            try {
                fs.writeFileSync(filePath, this.safeStringify(content));
            } catch (e) {
                if (e.code === 'ENOENT') {
                    fs.mkdirSync(filesystem.getDirName(filePath));
                }
            }
        }
    },

    updateFile (filePath, data, field, callback) {
        fs.stat(filePath, (err, stats) => {
            // check if file already exist
            if (!stats || !stats.isFile()) {
                const content = {};
                content[field] = data;
                fs.writeFile(filePath, this.safeStringify(content), () => {
                    data = null;
                    callback(err);
                });
            } else {
                // read file and parse json data
                fs.readFile(filePath, 'utf-8', (readErr, content) => {
                    let infoData = content ? (this.safeParse(content) || {}) : {};

                    if (infoData && !infoData[field]) {
                        infoData[field] = {};
                    }

                    infoData[field] = object.merge(infoData[field], data, false, true);

                    // update file
                    fs.writeFile(filePath, this.safeStringify(infoData), (writeErr) => {
                        infoData = null;
                        data = null;
                        callback(readErr || writeErr);
                    });
                });
            }
        });
    },

    prettify (str) {
        return this.safeStringify(this.safeParse(str), null, 4);
    },

    // load js, yaml, ini files and convert to json format
    loadToJson (filePath) {
        const readFile = filesystem.readFileSync({ path: filePath });
        const fileData = string.removeComments(readFile);

        switch (extname(filePath)) {
            case '.json':
                const jsonFile = this.safeParse(fileData);

                if (!jsonFile) {
                    throw new Error(`Cannot parse config file: ${filePath}`);
                }

                return jsonFile;

            case '.yaml':
            case '.yml':
                const yaml = require('yamljs');
                return yaml.parse(fileData);

            case '.ini':
                const ini = require('ini');
                return ini.parse(fileData);

            case '.xml':
                const xml2json = require('xml2json');
                const xmljson = this.safeParse(xml2json.toJson(fileData));

                if (!xmljson) {
                    throw new Error(`Cannot parse config XML file to JSON: ${filePath}`);
                }

                return xmljson;

            case '.js':
                return require(filePath);

            default:
                return false;
        }
    },

    toBase64 (obj) {
        return new Buffer(this.safeStringify(obj)).toString('base64');
    },

    fromBase64 (str) {
        return this.safeParse(new Buffer(str, 'base64').toString());
    },

    toMap (str) {
        return new Map(JSON.parse(str));
    },

    fromMap (map) {
        return JSON.stringify([...map]);
    }
};
