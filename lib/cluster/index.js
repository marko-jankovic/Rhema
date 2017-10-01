'use strict';

const cluster = require('cluster');
const utils = require('../utils');
const path = require('path');
const os = require('os');
const moment = require('moment');

class Phoenix {
    constructor (config) {
        // set uptime
        process.uptimeDate = new Date();

        let isMaster = false;

        process.on('uncaughtException', (err) => {
            logger.error(err.stack);
        });

        process.on('unhandledRejection', (err, promise) => {
            logger.error(err.stack);
        });

        // if cluster is enabled
        if (utils.env.isActive(config)) {
            // here will be Worker instances
            this.workers = {};

            // Master should be used only for forking
            // and monitoring child processes
            if (cluster.isMaster) {
                const numOfWorkers = this.getWorkersCount(config);

                if (numOfWorkers) {
                    logger.info('Starting Master Cluster process...');

                    this.handleMaster(config, numOfWorkers);
                    isMaster = cluster;
                }
            } else if (cluster.isWorker) {
                // in case process.send is not defined
                // which will be when cluster is off
                if (process.send) {
                    // Send message to Master process.
                    process.send({
                        msgFromWorker: {
                            type: 'WORKER-READY',
                            pid: process.pid
                        }
                    });
                }
            }
        } else {
            // cluster is off
            logger.debug('Standalone (non-clustered) server.');
        }

        return isMaster;
    }

    // spawing/forking a new worker and attached "message" listener
    // for sending a message from the {Master} process to the other {Workers}
    makeWorker (config, cluster, respawn) {
        const worker = cluster.fork();
        const pid = worker.process.pid;

        this.workers[pid] = worker;

        if (respawn) {
            logger.info(`Spawing new Worker (${pid}).`);
        } else {
            logger.info(`Worker #${pid} (${worker.process.pid}) is forked`);
        }

        // Receive messages from Worker and handle them in the Master process.
        worker.on('message', (message) => {
            Object.keys(cluster.workers).forEach((id) => {
                // Send a message from the Master process to the Worker.
                // Worker => Master => Workers
                // We are sending pid in every message so you can compare
                // current worker pid with recieved message pid
                if (message.msgFromWorker.pid !== cluster.workers[id].process.pid) {
                    cluster.workers[id].send({
                        msgFromMaster: message.msgFromWorker,
                        workerId: id
                    });
                }
            });
        });

        // Output from stdout and stderr in the parent process
        // when cluster has "setupMaster.silent" set to true
        // stderr and stdout event listeners don't exists
        if (worker.process.stderr && worker.process.stdout && worker.process.stderr.on && worker.process.stdout.on) {
            // catch errors like "process out of memory"
            worker.process.stderr.on('data', (data) => {
                data = data.toString();

                if (data.indexOf('#pid') === -1) {
                    logger.warn('STDERR:', data);
                } else {
                    console.log(data);
                }
            });

            // normal logs from logger
            worker.process.stdout.on('data', (data) => {
                data = data.toString();

                if (data.indexOf('#pid') === -1) {
                    logger.info('STDOUT:', data);
                } else {
                    console.log(data.toString());
                }
            });
        }

        this.updateLogFile(config, pid);

        return worker;
    }

    getWorkersCount (config) {
        let numOfWorkers = parseInt(config.workers) || os.cpus().length || 4;

        // We don't need to start a worker in this case
        if (numOfWorkers === 1) {
            numOfWorkers = 0;
        }

        return numOfWorkers;
    }

    handleMaster (config, numOfWorkers) {
        let throttleDetected = false;
        let spawningCount = 0;

        // cluster.SCHED_RR for round-robin or
        // cluster.SCHED_NONE to leave it to the operating system
        cluster.schedulingPolicy = cluster[config.schedulingPolicy || 'SCHED_NONE'];

        logger.info(`Fork ${numOfWorkers} Workers from Master process`);

        if (config.setupMaster) {
            cluster.setupMaster(config.setupMaster);
        }

        for (let i = 0; i < numOfWorkers; i++) {
            // delay Worker forking in order to prevent service init
            // and starting server in the same time for each numOfWorkers
            // if each Worker has init service that should do API call
            // API calls won't burden sensitive API services that are not able
            // to handle e.g. more than 10 parallel requests
            const timeout = setTimeout(() => {
                spawningCount++;
                this.makeWorker(config, cluster, false);
            }, i * (config.forkDelay || 0));

            timeout.unref();
        }

        // Listen for dying workers
        cluster.on('exit', (worker, code, signal) => {
            const pid = worker.process.pid;

            if (this.workers[pid]) {
                // remove the child from the list..
                delete this.workers[pid];
                logger.error(`Worker ${pid} has been deleted. Code: ${code}, Signal: ${signal}`);

                this.updateLogFile(config, pid);
            }

            // if it purposely destroyed itself, then do no re-spawn.
            // Otherwise, it was killed for some external reason and should create a new child
            if (!throttleDetected && !worker.exitedAfterDisconnect && (signal || code !== 0)) {
                // spawn new child
                // prevent CPU-splsions if crashing too fast
                const timeout = setTimeout(() => {
                    spawningCount++;
                    this.makeWorker(config, cluster, true);
                }, utils.math.getRandomInteger(1000, 5000));

                timeout.unref();
            } else {
                logger.error(`Error ${signal || code} - Worker ${worker.process.pid} exited unexpectedly.`);
            }
        });

        // Emitted after the worker IPC channel has disconnected.
        // This can occur when a worker exits gracefully, is killed,
        // or is disconnected manually (such as with worker.disconnect()).
        cluster.on('disconnect', (worker) => {
            logger.info(`Worker #${worker.id} (${worker.process.pid}) has disconnected`);
        });

        // Detect and prevent infinite dying and forking new processes
        if (config.forkThrottle) {
            // setInterval to 60sec
            const throttleInterval = setInterval(() => {
                // checking spawningCount
                if (spawningCount > config.workers * 3) {
                    // set flag to prevent calling this.makeWorker
                    throttleDetected = true;
                    logger.error('Workers massively die! Cluster will stop forking new processes!');
                    // clear interval
                    clearInterval(throttleInterval);
                } else {
                    // everything looks good, reset counter
                    spawningCount = 0;
                    throttleDetected = false;
                }
            }, 60000);
        }

        this.procesSignals(config, cluster);
    }

    // handling process kill signals
    procesSignals (config, cluster) {
        // create function to check self all workers are dead.
        const checkExit = () => {
            if (Object.keys(cluster.workers).length === 0) {
                process.exit();
            } else {
                setImmediate(checkExit); // keep polling for safe shutdown.
            }
        };

        // Application kill signals.
        config.killSignals.forEach((signal) => {
            process.on(signal, () => {
                Object.keys(cluster.workers).forEach((id) => {
                    logger.info(`Process signal: ${signal}`);

                    // kill method is the same as worker.destroy()
                    cluster.workers[id].kill(); // send suicide signal
                });

                // poll the master and exit when children are all gone.
                setImmediate(checkExit);
            });
        });
    }

    // export and save worker info
    // tracking how many workers has been created or died
    // "servers": {
    //      "{hostname}": {
    //          "workers":{
    //              "forked":[25907,25911,25949,25955,25975],
    //              "died":[25949]
    //           }
    //      }
    //  }
    updateLogFile (config, id) {
        if (config.export) {
            const hostname = os.hostname();
            const data = { [hostname]: { workers: { forked: [], died: [] } } };
            const infoPath = path.resolve(process.cwd(), config.export);
            const status = (typeof this.workers[id] === 'undefined') ? 'died' : 'forked';

            data[hostname].workers[status].push({
                pid: id,
                date: moment().format('MMM D HH:MM:ss')
            });

            return utils.json.updateFileSync(infoPath, data, 'servers');
        }
    }
}

module.exports = Phoenix;
