
let express = require('../'),
    request = require('supertest');

describe('app', () => {
    describe('.request', () => {
        it('should extend the request prototype', (done) => {
            const app = express();

            app.request.querystring = function () {
                return require('url').parse(this.url).query;
            };

            app.use((req, res) => {
                res.end(req.querystring());
            });

            request(app)
                .get('/foo?name=tobi')
                .expect('name=tobi', done);
        });
    });
});
