
let express = require('../'),
    request = require('supertest');

describe('req', () => {
    describe('.route', () => {
        it('should be the executed Route', (done) => {
            const app = express();

            app.get('/user/:id/:op?', (req, res, next) => {
                req.route.path.should.equal('/user/:id/:op?');
                next();
            });

            app.get('/user/:id/edit', (req, res) => {
                req.route.path.should.equal('/user/:id/edit');
                res.end();
            });

            request(app)
                .get('/user/12/edit')
                .expect(200, done);
        });
    });
});
