
const express = require('../');

describe('app.listen()', () => {
    it('should wrap with an HTTP server', (done) => {
        const app = express();

        app.del('/tobi', (req, res) => {
            res.end('deleted tobi!');
        });

        var server = app.listen(9999, () => {
            server.close();
            done();
        });
    });
});
