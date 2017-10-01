const chai = require('chai');
const Server = require('../index');
const Express = require('express');

describe('# Server', () => {
    it('should start Express Server', function (done) {
        this.timeout(5000);
        process.env.PORT = '8081';
        const expressApp = Express();
        const server = new Server({
            main: {
                framework: {
                    server: {
                        gracefulRestart: {
                            events: ['memoryUpperBound'],
                            timeout: 30000
                        }
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
