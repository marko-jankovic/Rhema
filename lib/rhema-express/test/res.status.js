
let express = require('../'),
    request = require('supertest');

describe('res', () => {
    describe('.status(code)', () => {
        it('should set the response .statusCode', (done) => {
            const app = express();

            app.use((req, res) => {
                res.status(201).end('Created');
            });

            request(app)
                .get('/')
                .expect('Created')
                .expect(201, done);
        });
    });
});
