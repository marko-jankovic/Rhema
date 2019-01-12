
let express = require('../'),
    request = require('supertest');

describe('app.del()', () => {
    it('should alias app.delete()', (done) => {
        const app = express();

        app.del('/tobi', (req, res) => {
            res.end('deleted tobi!');
        });

        request(app)
            .del('/tobi')
            .expect('deleted tobi!', done);
    });
});
