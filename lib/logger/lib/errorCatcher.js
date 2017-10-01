'use strict';

const crypto = require('crypto');
const fs = require('fs');
const readline = require('readline').createInterface;
const path = require('path');
const utils = require('../../utils');

module.exports = {
    $cache: {},

    updateLineObject (data = {}) {
        // cache keys
        const keys = Object.keys(data);

        // iterate line by line
        return (line = {}) => {
            // line key (message hash)
            const key = Object.keys(line)[0] || 0;

            // if already exists
            // update object
            if (keys.includes(key)) {
                // update {count} and {last}
                line[key].count += data[key].count;
                line[key].last = data[key].last;

                // remove {key} data from $cache
                delete data[key];
            }

            return line;
        };
    },

    updateLineByLine (filePath, data, callback) {
        // open '.tmp' file for reading
        const input = fs.createReadStream(`${filePath}.tmp`);
        const lineReader = readline({ input: input });
        // open {filePath} file for writing
        const output = fs.createWriteStream(filePath, { flags: 'a' });
        // return updated object
        const updateLine = this.updateLineObject(data);

        // read .tmp file line by line
        lineReader.on('line', (line) => {
            // parse line to json
            const readJsonLine = utils.json.safeParse(line) || {};

            // update json and write do dest
            const writeJsonLine = utils.json.safeStringify(updateLine(readJsonLine));
            output.write(`${writeJsonLine}\n`);
        });

        lineReader.on('close', () => {
            // when read stream is closed, write error objects that are left
            Object.keys(data).forEach((key) => {
                // create json line
                const writeJsonLine = `{"${key}": ${utils.json.safeStringify(data[key])}}`;
                output.write(`${writeJsonLine}\n`);
            });

            output.end(() => {
                logger.info('ErrorCatcher: log file has been updated.');
                callback(null);
            });
        });

        // handle i/o stream errors
        input.on('error', callback);
        output.on('error', callback);
    },

    prepareFile (filePath, callback) {
        const tempPath = `${filePath}.tmp`;

        // remove old .tmp file if exist
        utils.fs.unlinkFile(tempPath, () => {
            // Open file for appending, create file if it does not exist
            const output = fs.createWriteStream(filePath, { flags: 'a' });

            output.end(() => {
                // Rename {filePath} to {filePath}.tmp (syslog-errors.txt => syslog-errors.txt.tmp)
                fs.rename(filePath, tempPath, (renameErr) => {
                    if (!renameErr) {
                        logger.debug('ErrorCatcher: .tmp file has been created.');
                    }

                    callback(renameErr);
                });
            });

            output.on('error', callback);
        });
    },

    setErrorObject (data) {
        let hashKey = '';
        // trim stack messages
        const messageStack = data.message.split('\n').map(key => key.trim());

        const message = messageStack.shift() || '';
        // create message hash
        // message is unique per page since we have url in every ERROR message
        const messageHashKey = crypto.createHash('md5').update(message).digest('hex');

        // hash of first stack line to be sure we are tracking
        // error message with the same error stack
        if (messageStack.length !== 0) {
            const firstLineHashKey = crypto.createHash('md5').update(messageStack[0]).digest('hex');
            hashKey = `${messageHashKey}_${firstLineHashKey}`;
        } else {
            // error don't have stack
            // slice error message to 20 and assume that is the same type of error
            hashKey = crypto.createHash('md5').update(message.slice(0, 30)).digest('hex');
        }

        if (!this.$cache[hashKey]) {
            this.$cache[hashKey] = {
                first: data.timestamp,
                last: data.timestamp,
                count: 1,
                msg: message,
                stack: messageStack.length ? messageStack : null
            };
        } else {
            // update last occurrence and counter
            this.$cache[hashKey].last = data.timestamp;
            this.$cache[hashKey].count++;
        }
    },

    updateFile (dest, data, callback) {
        // full file path
        const filePath = path.resolve(process.cwd(), dest);

        this.prepareFile(filePath, (err) => {
            if (err) {
                callback(err);
            } else {
                this.updateLineByLine(filePath, data, (err) => {
                    if (err) {
                        callback(err);
                    } else {
                        // at the end, remove '.tmp' file
                        utils.fs.unlinkFile(`${filePath}.tmp`, callback);
                    }
                });
            }
        });
    },

    init (options) {
        this.$cache = {};

        setInterval(() => {
            // update file if there are new error objects
            if (Object.keys(this.$cache).length) {
                this.updateFile(options.export, this.$cache, (err) => {
                    if (err) {
                        logger.error('ErrorCatcher:', err);
                    } else {
                        logger.debug('ErrorCatcher: export error logs to', options.export);
                    }

                    this.$cache = {};
                });
            }
        }, options.interval || 600000);

        return (data) => {
            if (data.title === 'ERROR') {
                this.setErrorObject(data);
            }
        };
    }
};
