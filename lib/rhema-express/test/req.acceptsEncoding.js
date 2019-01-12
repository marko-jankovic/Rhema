
let express = require('../'),
    request = require('supertest');

describe('req', () => {
    describe('.acceptsEncoding', () => {
        it('should be true if encoding accepted', (done) => {
            const app = express();

            app.use((req, res) => {
                req.acceptsEncoding('gzip').should.be.ok();
                req.acceptsEncoding('deflate').should.be.ok();
                res.end();
            });

            request(app)
                .get('/')
                .set('Accept-Encoding', ' gzip, deflate')
                .expect(200, done);
        });

        it('should be false if encoding not accepted', (done) => {
            const app = express();

            app.use((req, res) => {
                req.acceptsEncoding('bogus').should.not.be.ok();
                res.end();
            });

            request(app)
                .get('/')
                .set('Accept-Encoding', ' gzip, deflate')
                .expect(200, done);
        });
    });
});
