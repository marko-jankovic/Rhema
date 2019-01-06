'use strict';

const os = require('os');
const hostname = require('os').hostname();
const utils = require('@rhema/utils');
const osUtils = require('@rhema/os');
// var startCpuUsage = process.cpuUsage();

const Controller = require('../baseController');
const packageJson = require('../../../package.json');

// general process and app status
class StatusController extends Controller {
    getAction (req, res) {
        const info = {
            cacheBusters: res.locals.cacheBusters.version,
            // @TODO - attach rhema change log
            rhemaVersion: packageJson.version,
            hostname,
            process: {
                pid: process.pid,
                uptime: utils.app.convertUptime(process.uptime()),
                humanUpTime: process.uptimeDate.toUTCString(),
                versions: process.versions,
                memoryUsage: {
                    rss: utils.math.bytesToSize(process.memoryUsage().rss, 2),
                    heapTotal: utils.math.bytesToSize(process.memoryUsage().heapTotal, 2),
                    heapUsed: utils.math.bytesToSize(process.memoryUsage().heapUsed, 2)
                },
                 // cpuUsage: process.cpuUsage(startCpuUsage),
                platform: process.platform
            },
            global: {
                memory: {
                    totalMemory: osUtils.totalMemory(),
                    freeMemory: osUtils.freeMemory(),
                    memoryPercentUsed: osUtils.memoryPercentUsed()
                },
                cpu: {
                    uptime: utils.app.convertUptime(os.uptime()),
                    info: os.cpus()
                }
            }
        };

        this.json(null, info);
    }
}

module.exports = StatusController;
