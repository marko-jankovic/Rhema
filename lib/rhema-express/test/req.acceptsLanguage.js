
let express = require('../'),
    request = require('supertest');

describe('req', () => {
    describe('.acceptsLanguage', () => {
        it('should be true if language accepted', (done) => {
            const app = express();

            app.use((req, res) => {
                req.acceptsLanguage('en-us').should.be.ok();
                req.acceptsLanguage('en').should.be.ok();
                res.end();
            });

            request(app)
                .get('/')
                .set('Accept-Language', 'en;q=.5, en-us')
                .expect(200, done);
        });

        it('should be false if language not accepted', (done) => {
            const app = express();

            app.use((req, res) => {
                req.acceptsLanguage('es').should.not.be.ok();
                res.end();
            });

            request(app)
                .get('/')
                .set('Accept-Language', 'en;q=.5, en-us')
                .expect(200, done);
        });

        describe('when Accept-Language is not present', () => {
            it('should always return true', (done) => {
                const app = express();

                app.use((req, res) => {
                    req.acceptsLanguage('en').should.be.ok();
                    req.acceptsLanguage('es').should.be.ok();
                    req.acceptsLanguage('jp').should.be.ok();
                    res.end();
                });

                request(app)
                    .get('/')
                    .expect(200, done);
            });
        });
    });
});
