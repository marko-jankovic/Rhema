
let express = require('../'),
    request = require('supertest');

describe('res', () => {
    describe('.locals', () => {
        it('should be empty by default', (done) => {
            const app = express();

            app.use((req, res) => {
                Object.keys(res.locals).should.eql([]);
                res.end();
            });

            request(app)
                .get('/')
                .expect(200, done);
        });
    });

    it('should work when mounted', (done) => {
        const app = express();
        const blog = express();

        app.use(blog);

        blog.use((req, res, next) => {
            res.locals.foo = 'bar';
            next();
        });

        app.use((req, res) => {
            res.locals.foo.should.equal('bar');
            res.end();
        });

        request(app)
            .get('/')
            .expect(200, done);
    });
});
