
let express = require('../'),
    request = require('supertest');

describe('req', () => {
    describe('.acceptsCharset(type)', () => {
        describe('when Accept-Charset is not present', () => {
            it('should return true', (done) => {
                const app = express();

                app.use((req, res, next) => {
                    res.end(req.acceptsCharset('utf-8') ? 'yes' : 'no');
                });

                request(app)
                    .get('/')
                    .expect('yes', done);
            });
        });

        describe('when Accept-Charset is not present', () => {
            it('should return true when present', (done) => {
                const app = express();

                app.use((req, res, next) => {
                    res.end(req.acceptsCharset('utf-8') ? 'yes' : 'no');
                });

                request(app)
                    .get('/')
                    .set('Accept-Charset', 'foo, bar, utf-8')
                    .expect('yes', done);
            });

            it('should return false otherwise', (done) => {
                const app = express();

                app.use((req, res, next) => {
                    res.end(req.acceptsCharset('utf-8') ? 'yes' : 'no');
                });

                request(app)
                    .get('/')
                    .set('Accept-Charset', 'foo, bar')
                    .expect('no', done);
            });
        });
    });
});
