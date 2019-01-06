'use strict';

const Controller = require('../baseController');
const fs = require('fs');
const os = require('os');
const path = require('path');
const utils = require('@rhema/utils');
const readline = require('readline').createInterface;

// route for getting $cache property inside service
class SyslogErrors extends Controller {
    getAction (req, res) {
        const input = fs.createReadStream(path.resolve(process.cwd(), './build/profiler/syslog-errors.txt'));
        const lineReader = readline({ input: input });
        const host = os.hostname();
        const response = { [host]: {} };

        lineReader.on('line', (line) => {
            // parse line to json
            Object.assign(response[host], utils.json.safeParse(line) || {});
        });

        lineReader.on('close', () => {
            this.json(null, response);
        });

        input.on('error', (err) => {
            if (err.code === 'ENOENT') {
                this.json(null, response);
            } else {
                this.json({ message: err });
            }
        });
    }
}

module.exports = SyslogErrors;
