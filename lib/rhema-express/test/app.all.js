
let express = require('../'),
    request = require('supertest');

describe('app.all()', () => {
    it('should add a router per method', (done) => {
        const app = express();

        app.all('/tobi', (req, res) => {
            res.end(req.method);
        });

        request(app)
            .put('/tobi')
            .expect('PUT', () => {
                request(app)
                    .get('/tobi')
                    .expect('GET', done);
            });
    });

    it('should run the callback for a method just once', (done) => {
        let app = express(),
            n = 0;

        app.all('/*', (req, res, next) => {
            if (n++) {
                return done(new Error('DELETE called several times'));
            }
            next();
        });

        request(app)
            .del('/tobi')
            .expect(404, done);
    });
});
