
const after = require('after');
let express = require('../'),
    request = require('supertest'),
    assert = require('assert');

const app1 = express();

app1.use((req, res, next) => {
    res.format({
        'text/plain': function () {
            res.send('hey');
        },

        'text/html': function () {
            res.send('<p>hey</p>');
        },

        'application/json': function (a, b, c) {
            assert(req === a);
            assert(res === b);
            assert(next === c);
            res.send({ message: 'hey' });
        }
    });
});

app1.use((err, req, res, next) => {
    if (!err.types) {
        throw err;
    }
    res.send(err.status, `Supports: ${err.types.join(', ')}`);
});

const app2 = express();

app2.use((req, res, next) => {
    res.format({
        text: function () {
            res.send('hey');
        },
        html: function () {
            res.send('<p>hey</p>');
        },
        json: function () {
            res.send({ message: 'hey' });
        }
    });
});

app2.use((err, req, res, next) => {
    res.send(err.status, `Supports: ${err.types.join(', ')}`);
});

const app3 = express();

app3.use((req, res, next) => {
    res.format({
        text: function () {
            res.send('hey');
        },
        default: function () {
            res.send('default');
        }
    });
});

const app4 = express();

app4.get('/', (req, res, next) => {
    res.format({
        text: function () {
            res.send('hey');
        },
        html: function () {
            res.send('<p>hey</p>');
        },
        json: function () {
            res.send({ message: 'hey' });
        }
    });
});

app4.use((err, req, res, next) => {
    res.send(err.status, `Supports: ${err.types.join(', ')}`);
});

const app5 = express();

app5.use((req, res, next) => {
    res.format({
        default: function () {
            res.send('hey');
        }
    });
});

describe('res', () => {
    describe('.format(obj)', () => {
        describe('with canonicalized mime types', () => {
            test(app1);
        });

        describe('with extnames', () => {
            test(app2);
        });

        describe('with parameters', () => {
            const app = express();

            app.use((req, res, next) => {
                res.format({
                    'text/plain; charset=utf-8': function () {
                        res.send('hey');
                    },
                    'text/html; foo=bar; bar=baz': function () {
                        res.send('<p>hey</p>');
                    },
                    'application/json; q=0.5': function () {
                        res.send({ message: 'hey' });
                    }
                });
            });

            app.use((err, req, res, next) => {
                res.send(err.status, `Supports: ${err.types.join(', ')}`);
            });

            test(app);
        });

        describe('given .default', () => {
            it('should be invoked instead of auto-responding', (done) => {
                request(app3)
                    .get('/')
                    .set('Accept', 'text/html')
                    .expect('default', done);
            });

            it('should work when only .default is provided', (done) => {
                request(app5)
                    .get('/')
                    .set('Accept', '*/*')
                    .expect('hey', done);
            });
        });

        describe('in router', () => {
            test(app4);
        });

        describe('in router', () => {
            const app = express();
            const router = express.Router();

            router.get('/', (req, res, next) => {
                res.format({
                    text: function () {
                        res.send('hey');
                    },
                    html: function () {
                        res.send('<p>hey</p>');
                    },
                    json: function () {
                        res.send({ message: 'hey' });
                    }
                });
            });

            router.use((err, req, res, next) => {
                res.send(err.status, `Supports: ${err.types.join(', ')}`);
            });

            app.use(router);

            test(app);
        });
    });
});

function test (app) {
    it('should utilize qvalues in negotiation', (done) => {
        request(app)
            .get('/')
            .set('Accept', 'text/html; q=.5, application/json, */*; q=.1')
            .expect({ message: 'hey' }, done);
    });

    it('should allow wildcard type/subtypes', (done) => {
        request(app)
            .get('/')
            .set('Accept', 'text/html; q=.5, application/*, */*; q=.1')
            .expect({ message: 'hey' }, done);
    });

    it('should default the Content-Type', (done) => {
        request(app)
            .get('/')
            .set('Accept', 'text/html; q=.5, text/plain')
            .expect('Content-Type', 'text/plain; charset=utf-8')
            .expect('hey', done);
    });

    it('should set the correct charset for the Content-Type', (done) => {
        const cb = after(3, done);

        request(app)
            .get('/')
            .set('Accept', 'text/html')
            .expect('Content-Type', 'text/html; charset=utf-8', cb);

        request(app)
            .get('/')
            .set('Accept', 'text/plain')
            .expect('Content-Type', 'text/plain; charset=utf-8', cb);

        request(app)
            .get('/')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8', cb);
    });

    it('should Vary: Accept', (done) => {
        request(app)
            .get('/')
            .set('Accept', 'text/html; q=.5, text/plain')
            .expect('Vary', 'Accept', done);
    });

    describe('when Accept is not present', () => {
        it('should invoke the first callback', (done) => {
            request(app)
                .get('/')
                .expect('hey', done);
        });
    });

    describe('when no match is made', () => {
        it('should should respond with 406 not acceptable', (done) => {
            request(app)
                .get('/')
                .set('Accept', 'foo/bar')
                .expect('Supports: text/plain, text/html, application/json')
                .expect(406, done);
        });
    });
}
