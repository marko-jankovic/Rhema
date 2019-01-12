
let express = require('../'),
    request = require('supertest'),
    cookie = require('cookie'),
    cookieParser = require('cookie-parser');
const merge = require('utils-merge');

describe('res', () => {
    describe('.cookie(name, object)', () => {
        it('should generate a JSON cookie', (done) => {
            const app = express();

            app.use((req, res) => {
                res.cookie('user', { name: 'tobi' }).end();
            });

            request(app)
                .get('/')
                .expect('Set-Cookie', 'user=j%3A%7B%22name%22%3A%22tobi%22%7D; Path=/')
                .expect(200, done);
        });
    });

    describe('.cookie(name, string)', () => {
        it('should set a cookie', (done) => {
            const app = express();

            app.use((req, res) => {
                res.cookie('name', 'tobi').end();
            });

            request(app)
                .get('/')
                .expect('Set-Cookie', 'name=tobi; Path=/')
                .expect(200, done);
        });

        it('should allow multiple calls', (done) => {
            const app = express();

            app.use((req, res) => {
                res.cookie('name', 'tobi');
                res.cookie('age', 1);
                res.cookie('gender', '?');
                res.end();
            });

            request(app)
                .get('/')
                .end((err, res) => {
                    const val = ['name=tobi; Path=/', 'age=1; Path=/', 'gender=%3F; Path=/'];
                    res.headers['set-cookie'].should.eql(val);
                    done();
                });
        });
    });

    describe('.cookie(name, string, options)', () => {
        it('should set params', (done) => {
            const app = express();

            app.use((req, res) => {
                res.cookie('name', 'tobi', { httpOnly: true, secure: true });
                res.end();
            });

            request(app)
                .get('/')
                .expect('Set-Cookie', 'name=tobi; Path=/; HttpOnly; Secure')
                .expect(200, done);
        });

        describe('maxAge', () => {
            it('should set relative expires', (done) => {
                const app = express();

                app.use((req, res) => {
                    res.cookie('name', 'tobi', { maxAge: 1000 });
                    res.end();
                });

                request(app)
                    .get('/')
                    .end((err, res) => {
                        res.headers['set-cookie'][0].should.not.containEql('Thu, 01 Jan 1970 00:00:01 GMT');
                        done();
                    });
            });

            it('should set max-age', (done) => {
                const app = express();

                app.use((req, res) => {
                    res.cookie('name', 'tobi', { maxAge: 1000 });
                    res.end();
                });

                request(app)
                    .get('/')
                    .expect('Set-Cookie', /Max-Age=1/, done);
            });

            it('should not mutate the options object', (done) => {
                const app = express();

                const options = { maxAge: 1000 };
                const optionsCopy = merge({}, options);

                app.use((req, res) => {
                    res.cookie('name', 'tobi', options);
                    res.end();
                });

                request(app)
                    .get('/')
                    .end((err, res) => {
                        options.should.eql(optionsCopy);
                        done();
                    });
            });
        });

        describe('signed', () => {
            it('should generate a signed JSON cookie', (done) => {
                const app = express();

                app.use(cookieParser('foo bar baz'));

                app.use((req, res) => {
                    res.cookie('user', { name: 'tobi' }, { signed: true }).end();
                });

                request(app)
                    .get('/')
                    .end((err, res) => {
                        let val = res.headers['set-cookie'][0];
                        val = cookie.parse(val.split('.')[0]);
                        val.user.should.equal('s:j:{"name":"tobi"}');
                        done();
                    });
            });
        });

        describe('signed without secret', () => {
            it('should throw an error', (done) => {
                const app = express();

                app.use(cookieParser());

                app.use((req, res) => {
                    res.cookie('name', 'tobi', { signed: true }).end();
                });

                request(app)
                    .get('/')
                    .expect(500, /secret\S+ required for signed cookies/, done);
            });
        });

        describe('.signedCookie(name, string)', () => {
            it('should set a signed cookie', (done) => {
                const app = express();

                app.use(cookieParser('foo bar baz'));

                app.use((req, res) => {
                    res.cookie('name', 'tobi', { signed: true }).end();
                });

                request(app)
                    .get('/')
                    .expect('Set-Cookie', 'name=s%3Atobi.xJjV2iZ6EI7C8E5kzwbfA9PVLl1ZR07UTnuTgQQ4EnQ; Path=/')
                    .expect(200, done);
            });
        });
    });
});
