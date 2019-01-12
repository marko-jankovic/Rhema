
const after = require('after');
const should = require('should');
let express = require('../'),
    Route = express.Route,
    methods = require('methods');

describe('Route', () => {
    it('should work without handlers', (done) => {
        const req = { method: 'GET', url: '/' };
        const route = new Route('/foo');
        route.dispatch(req, {}, done);
    });

    describe('.all', () => {
        it('should add handler', (done) => {
            const req = { method: 'GET', url: '/' };
            const route = new Route('/foo');

            route.all((req, res, next) => {
                req.called = true;
                next();
            });

            route.dispatch(req, {}, (err) => {
                if (err) {
                    return done(err);
                }
                should(req.called).be.ok();
                done();
            });
        });

        it('should handle VERBS', (done) => {
            let count = 0;
            const route = new Route('/foo');
            const cb = after(methods.length, (err) => {
                if (err) {
                    return done(err);
                }
                count.should.equal(methods.length);
                done();
            });

            route.all((req, res, next) => {
                count++;
                next();
            });

            methods.forEach((method) => {
                const req = { method: method, url: '/' };
                route.dispatch(req, {}, cb);
            });
        });

        it('should stack', (done) => {
            const req = { count: 0, method: 'GET', url: '/' };
            const route = new Route('/foo');

            route.all((req, res, next) => {
                req.count++;
                next();
            });

            route.all((req, res, next) => {
                req.count++;
                next();
            });

            route.dispatch(req, {}, (err) => {
                if (err) {
                    return done(err);
                }
                req.count.should.equal(2);
                done();
            });
        });
    });

    describe('.VERB', () => {
        it('should support .get', (done) => {
            const req = { method: 'GET', url: '/' };
            const route = new Route('');

            route.get((req, res, next) => {
                req.called = true;
                next();
            });

            route.dispatch(req, {}, (err) => {
                if (err) {
                    return done(err);
                }
                should(req.called).be.ok();
                done();
            });
        });

        it('should limit to just .VERB', (done) => {
            const req = { method: 'POST', url: '/' };
            const route = new Route('');

            route.get((req, res, next) => {
                throw new Error('not me!');
            });

            route.post((req, res, next) => {
                req.called = true;
                next();
            });

            route.dispatch(req, {}, (err) => {
                if (err) {
                    return done(err);
                }
                should(req.called).be.true();
                done();
            });
        });

        it('should allow fallthrough', (done) => {
            const req = { order: '', method: 'GET', url: '/' };
            const route = new Route('');

            route.get((req, res, next) => {
                req.order += 'a';
                next();
            });

            route.all((req, res, next) => {
                req.order += 'b';
                next();
            });

            route.get((req, res, next) => {
                req.order += 'c';
                next();
            });

            route.dispatch(req, {}, (err) => {
                if (err) {
                    return done(err);
                }
                req.order.should.equal('abc');
                done();
            });
        });
    });

    describe('errors', () => {
        it('should handle errors via arity 4 functions', (done) => {
            const req = { order: '', method: 'GET', url: '/' };
            const route = new Route('');

            route.all((req, res, next) => {
                next(new Error('foobar'));
            });

            route.all((req, res, next) => {
                req.order += '0';
                next();
            });

            route.all((err, req, res, next) => {
                req.order += 'a';
                next(err);
            });

            route.dispatch(req, {}, (err) => {
                should(err).be.ok();
                should(err.message).equal('foobar');
                req.order.should.equal('a');
                done();
            });
        });

        it('should handle throw', (done) => {
            const req = { order: '', method: 'GET', url: '/' };
            const route = new Route('');

            route.all((req, res, next) => {
                throw new Error('foobar');
            });

            route.all((req, res, next) => {
                req.order += '0';
                next();
            });

            route.all((err, req, res, next) => {
                req.order += 'a';
                next(err);
            });

            route.dispatch(req, {}, (err) => {
                should(err).be.ok();
                should(err.message).equal('foobar');
                req.order.should.equal('a');
                done();
            });
        });

        it('should handle throwing inside error handlers', (done) => {
            const req = { method: 'GET', url: '/' };
            const route = new Route('');

            route.get((req, res, next) => {
                throw new Error('boom!');
            });

            route.get((err, req, res, next) => {
                throw new Error('oops');
            });

            route.get((err, req, res, next) => {
                req.message = err.message;
                next();
            });

            route.dispatch(req, {}, (err) => {
                if (err) {
                    return done(err);
                }
                should(req.message).equal('oops');
                done();
            });
        });

        it('should handle throw in .all', (done) => {
            const req = { method: 'GET', url: '/' };
            const route = new Route('');

            route.all((req, res, next) => {
                throw new Error('boom!');
            });

            route.dispatch(req, {}, (err) => {
                should(err).be.ok();
                err.message.should.equal('boom!');
                done();
            });
        });

        it('should handle single error handler', (done) => {
            const req = { method: 'GET', url: '/' };
            const route = new Route('');

            route.all((err, req, res, next) => {
                // this should not execute
                true.should.be.false();
            });

            route.dispatch(req, {}, done);
        });
    });
});
