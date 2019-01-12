'use strict';

const assert = require('@rhema/testing').assert;
const Cluster = require('../index.js');

describe('# Cluster without config', () => {
    let cluster = null;
    beforeEach(() => {
        cluster = new Cluster();
    });

    it('Cluster should be false', () => {
        assert.isUndefined(cluster.isMaster);
    });
});

describe('# Cluster with config', () => {
    let cluster = null;
    beforeEach(() => {
        cluster = new Cluster({
            workers: 2,
            forkDelay: 2000,
            schedulingPolicy: 'SCHED_RR',
            killSignals: ['SIGINT', 'SIGTERM', 'SIGQUIT'],
            setupMaster: {
                silent: false
            }
        });
    });

    it('Test Cluster init with config', function (done) {
        this.timeout(10000);

        if (cluster.isMaster) {
            cluster.on('online', (worker) => {
                assert.property(cluster, 'workers');
                assert.property(worker, 'id');
                assert.property(worker, 'state');
                assert.property(worker.process, 'pid');
                assert.equal(worker.state, 'online');
                worker.kill();
            });

            cluster.on('exit', (worker) => {
                if (worker.id === 2) {
                    assert.equal(worker.state, 'dead');
                    assert.isTrue(worker.process.killed);
                    assert.equal(worker.process.signalCode, 'SIGTERM');
                    assert.isTrue(worker.exitedAfterDisconnect);

                    done();
                }
            });
        }
    });
});
