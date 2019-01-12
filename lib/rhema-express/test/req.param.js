
let express = require('../'),
    request = require('supertest');

describe('req', () => {
    describe('.param(name, default)', () => {
        it('should use the default value unless defined', (done) => {
            const app = express();

            app.use((req, res) => {
                res.end(req.param('name', 'tj'));
            });

            request(app)
                .get('/')
                .expect('tj', done);
        });
    });

    describe('.param(name)', () => {
        it('should check req.query', (done) => {
            const app = express();

            app.use((req, res) => {
                res.end(req.param('name'));
            });

            request(app)
                .get('/?name=tj')
                .expect('tj', done);
        });

        it('should check req.body', (done) => {
            const app = express();

            app.use(express.json());

            app.use((req, res) => {
                res.end(req.param('name'));
            });

            request(app)
                .post('/')
                .send({ name: 'tj' })
                .expect('tj', done);
        });

        it('should check req.params', (done) => {
            const app = express();

            app.get('/user/:name', (req, res) => {
                res.end(req.param('filter') + req.param('name'));
            });

            request(app)
                .get('/user/tj')
                .expect('undefinedtj', done);
        });
    });
});
