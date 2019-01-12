
let express = require('../'),
    request = require('supertest');

describe('req', () => {
    describe('.query', () => {
        it('should default to {}', (done) => {
            const app = createApp();

            request(app)
                .get('/')
                .expect(200, '{}', done);
        });

        it('should default to parse complex keys', (done) => {
            const app = createApp();

            request(app)
                .get('/?user[name]=tj')
                .expect(200, '{"user":{"name":"tj"}}', done);
        });

        describe('when "query parser" is extended', () => {
            it('should parse complex keys', (done) => {
                const app = createApp('extended');

                request(app)
                    .get('/?user[name]=tj')
                    .expect(200, '{"user":{"name":"tj"}}', done);
            });

            it('should parse parameters with dots', (done) => {
                const app = createApp('extended');

                request(app)
                    .get('/?user.name=tj')
                    .expect(200, '{"user.name":"tj"}', done);
            });
        });

        describe('when "query parser" is simple', () => {
            it('should not parse complex keys', (done) => {
                const app = createApp('simple');

                request(app)
                    .get('/?user%5Bname%5D=tj')
                    .expect(200, '{"user[name]":"tj"}', done);
            });
        });

        describe('when "query parser" is a function', () => {
            it('should parse using function', (done) => {
                const app = createApp(str => ({ length: (str || '').length }));

                request(app)
                    .get('/?user%5Bname%5D=tj')
                    .expect(200, '{"length":17}', done);
            });
        });

        describe('when "query parser" disabled', () => {
            it('should not parse query', (done) => {
                const app = createApp(false);

                request(app)
                    .get('/?user%5Bname%5D=tj')
                    .expect(200, '{}', done);
            });
        });

        describe('when "query parser" disabled', () => {
            it('should not parse complex keys', (done) => {
                const app = createApp(true);

                request(app)
                    .get('/?user%5Bname%5D=tj')
                    .expect(200, '{"user[name]":"tj"}', done);
            });
        });

        describe('when "query parser fn" is missing', () => {
            it('should act like "extended"', (done) => {
                const app = express();

                delete app.settings['query parser'];
                delete app.settings['query parser fn'];

                app.use((req, res) => {
                    res.send(req.query);
                });

                request(app)
                    .get('/?user[name]=tj&user.name=tj')
                    .expect(200, '{"user":{"name":"tj"},"user.name":"tj"}', done);
            });
        });

        describe('when "query parser" an unknown value', () => {
            it('should throw', () => {
                createApp.bind(null, 'bogus').should.throw(/unknown value.*query parser/);
            });
        });
    });
});

function createApp (setting) {
    const app = express();

    if (setting !== undefined) {
        app.set('query parser', setting);
    }

    app.use((req, res) => {
        res.send(req.query);
    });

    return app;
}
