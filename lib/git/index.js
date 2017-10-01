'use strict';

const exec = require('child_process').exec;
const async = require('async');

const executeCommand = function executeCommand (cmd, callback) {
    try {
        exec(cmd, { cwd: __dirname }, (err, stdout, stderr) => {
            if (typeof stdout === 'string') {
                callback(err, stdout.replace('\n', ''));
            } else {
                callback(err, stdout);
            }
        });
    } catch (e) {
        callback(e);
    }
};

module.exports = {
    execute: function get (list, callback) {
        const tasks = {};

        if (Array.isArray(list)) {
            list.forEach((l) => {
                if (this[l]) {
                    tasks[l] = this[l];
                }
            });
        }

        async.series(tasks, callback);
    },

    shortCommitNumber: function shortCommitNumber (callback) {
        executeCommand('git log -1 --pretty="format:%h"', callback);
    },

    longCommitNumber: function longCommitNumber (callback) {
        executeCommand('git log -1 --pretty="format:%H"', callback);
    },

    branchName: function branchName (callback) {
        executeCommand('git rev-parse --abbrev-ref HEAD', callback);
    },

    lastTag: function lastTag (callback) {
        executeCommand('git describe --always --tag --abbrev=0', callback);
    },

    lastCommitMessage: function lastCommitMessage (callback) {
        executeCommand('git log -1 --pretty="format:%s"', callback);
    },

    commitLog: function commitLog (numberOfCommits, callback) {
        if (!callback) {
            callback = numberOfCommits;
            numberOfCommits = 10;
        }

        executeCommand(`git log --oneline -n ${numberOfCommits} --pretty=format:\'{"commit": "%H", "author": "%an", "before": "%cr", "date": "%ad", "message": "%f"}#\'`, (err, data) => {
            const splited = data.split('#');
            const obj = [];

            splited.forEach((message) => {
                if (message.length !== 0) {
                    obj.push(JSON.parse(message));
                }
            });

            callback(err, obj);
        });
    },

    whatChanged: function whatChanged (time, callback) {
        if (!callback) {
            callback = time;
            time = '1 week ago';
        }

        executeCommand(`git whatchanged --since="${time}"`, callback);
    }
};
