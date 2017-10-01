'use strict';

const os = require('os');
const disks = require('nodejs-disks');
const utils = require('../utils');
const OsUtils = function () {};

OsUtils.getLocalIpAddress = function () {
    let address = false;

    if (utils.env.isLocal()) {
        const networkInterfaces = os.networkInterfaces();

        if (networkInterfaces && networkInterfaces.en0) {
            networkInterfaces.en0.forEach((host) => {
                if (host.address && utils.regex.isValid('ip', host.address)) {
                    address = host.address;
                }
            });
        }
    }

    return address;
};

OsUtils.totalMemory = function (raw) {
    if (raw) {
        return os.totalmem();
    }

    return utils.math.bytesToSize(os.totalmem(), 2);
};

OsUtils.freeMemory = function (raw) {
    if (raw) {
        return os.freemem();
    }

    return utils.math.bytesToSize(os.freemem(), 2);
};

OsUtils.memoryPercentUsed = function (raw) {
    if (raw) {
        return (os.freemem() / os.totalmem());
    }

    return parseFloat(((1 - (os.freemem() / os.totalmem())) * 100).toFixed(2));
};

// Hard Disk Drive
OsUtils.hardDiskInfo = function (callback) {
    disks.drives((err, drives) => {
        disks.drivesDetail(drives, callback);
    });
};

OsUtils.cpuFree = function (callback) {
    this.getCPUUsage(callback, true);
};

OsUtils.cpuUsage = function (callback) {
    this.getCPUUsage(callback, false);
};

OsUtils.getCPUUsage = function (callback, free) {
    const stats1 = this.getCPUInfo();
    const startIdle = stats1.idle;
    const startTotal = stats1.total;

    setTimeout(() => {
        const stats2 = this.getCPUInfo();
        const endIdle = stats2.idle;
        const endTotal = stats2.total;
        const idle = endIdle - startIdle;
        const total = endTotal - startTotal;
        const perc = idle / total;

        if (free === true) {
            callback((perc * 100).toFixed(2));
        } else {
            callback(((1 - perc) * 100).toFixed(2));
        }
    }, 1000);
};

OsUtils.getCPUInfo = function () {
    const cpus = os.cpus();
    let user = 0;
    let nice = 0;
    let sys = 0;
    let idle = 0;
    let irq = 0;

    for (const cpu in cpus) {
        if (cpus.hasOwnProperty(cpu)) {
            user += cpus[cpu].times.user;
            nice += cpus[cpu].times.nice;
            sys += cpus[cpu].times.sys;
            irq += cpus[cpu].times.irq;
            idle += cpus[cpu].times.idle;
        }
    }

    const total = user + nice + sys + idle + irq;

    return {
        idle,
        total
    };
};

module.exports = OsUtils;
