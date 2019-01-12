
let express = require('../'),
    request = require('supertest');

describe('req', () => {
    describe('.path', () => {
        it('should return the parsed pathname', (done) => {
            const app = express();

            app.use((req, res) => {
                res.end(req.path);
            });

            request(app)
                .get('/login?redirect=/post/1/comments')
                .expect('/login', done);
        });
    });
});
