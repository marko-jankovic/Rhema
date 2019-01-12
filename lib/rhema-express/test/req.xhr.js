
let express = require('../'),
    request = require('supertest');

describe('req', () => {
    describe('.xhr', () => {
        it('should return true when X-Requested-With is xmlhttprequest', (done) => {
            const app = express();

            app.use((req, res) => {
                req.xhr.should.be.true();
                res.end();
            });

            request(app)
                .get('/')
                .set('X-Requested-With', 'xmlhttprequest')
                .expect(200, done);
        });

        it('should case-insensitive', (done) => {
            const app = express();

            app.use((req, res) => {
                req.xhr.should.be.true();
                res.end();
            });

            request(app)
                .get('/')
                .set('X-Requested-With', 'XMLHttpRequest')
                .expect(200, done);
        });

        it('should return false otherwise', (done) => {
            const app = express();

            app.use((req, res) => {
                req.xhr.should.be.false();
                res.end();
            });

            request(app)
                .get('/')
                .set('X-Requested-With', 'blahblah')
                .expect(200, done);
        });

        it('should return false when not present', (done) => {
            const app = express();

            app.use((req, res) => {
                req.xhr.should.be.false();
                res.end();
            });

            request(app)
                .get('/')
                .expect(200, done);
        });
    });
});
