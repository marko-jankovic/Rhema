'use strict';

const utils = require('../../utils');
const os = require('os');
const osUtils = require('../../os/');
const hostname = require('os').hostname();
// var startCpuUsage = process.cpuUsage();

const Controller = require('../baseController');
const gitStatus = require('../../git');
const packageJson = require('../../../package.json');

// general process and app status
class StatusController extends Controller {
    getAction (req, res) {
        const otherInfo = {
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

        gitStatus.execute(['lastTag', 'branchName', 'commitLog'], (err, gitLog) => {
            gitLog.cacheBusters = res.locals.cacheBusters.version;
            // @TODO - attach rhema change log
            gitLog.rhemaVersion = packageJson.version;
            this.json(null, Object.assign(otherInfo, { git: gitLog }));
        });
    }
}

module.exports = StatusController;
