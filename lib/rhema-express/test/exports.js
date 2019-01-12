
const express = require('../');
const request = require('supertest');
const should = require('should');

describe('exports', () => {
    it('should expose Router', () => {
        express.Router.should.be.a.Function();
    });

    it('should expose the application prototype', () => {
        express.application.set.should.be.a.Function();
    });

    it('should expose the request prototype', () => {
        express.request.accepts.should.be.a.Function();
    });

    it('should expose the response prototype', () => {
        express.response.send.should.be.a.Function();
    });

    it('should permit modifying the .application prototype', () => {
        express.application.foo = function () {
            return 'bar';
        };
        express().foo().should.equal('bar');
    });

    it('should permit modifying the .request prototype', (done) => {
        express.request.foo = function () {
            return 'bar';
        };
        const app = express();

        app.use((req, res, next) => {
            res.end(req.foo());
        });

        request(app)
            .get('/')
            .expect('bar', done);
    });

    it('should permit modifying the .response prototype', (done) => {
        express.response.foo = function () {
            this.send('bar');
        };
        const app = express();

        app.use((req, res, next) => {
            res.foo();
        });

        request(app)
            .get('/')
            .expect('bar', done);
    });

    it('should throw on old middlewares', () => {
        let error;
        try {
            express.bodyParser;
        } catch (e) {
            error = e;
        }
        should(error).have.property('message');
        error.message.should.containEql('middleware');
        error.message.should.containEql('bodyParser');
    });
});
