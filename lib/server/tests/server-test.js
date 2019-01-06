const chai = require('chai');
const Server = require('../index');
const Express = require('express');

describe('# Server', () => {
    it('should start Express Server', function (done) {
        this.timeout(5000);
        const expressApp = Express();
        process.env.PORT = '8081';
        const server = new Server({
            main: {
                framework: {
                    server: {
                        name: 'main',
                        gracefulRestart: {
                            events: ['memoryUpperBound'],
                            timeout: 30000
                        }
                    },
                    cluster: { disabled: true },
                    metrics: { disabled: true },
                    profiler: {
                        memory: { disabled: true },
                        cpu: { disabled: true }
                    }
                },
                app: { vhosts: ['localhost'] }
            }
        });

        server(expressApp, (serverInstance, gracefulRestart) => {
            gracefulRestart(serverInstance, 'memoryUpperBoun', () => {
                done();
            });
        });
    });
});
