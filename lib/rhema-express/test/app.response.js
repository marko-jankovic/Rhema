
let express = require('../'),
    request = require('supertest');

describe('app', () => {
    describe('.response', () => {
        it('should extend the response prototype', (done) => {
            const app = express();

            app.response.shout = function (str) {
                this.send(str.toUpperCase());
            };

            app.use((req, res) => {
                res.shout('hey');
            });

            request(app)
                .get('/')
                .expect('HEY', done);
        });

        it('should not be influenced by other app protos', (done) => {
            let app = express(),
                app2 = express();

            app.response.shout = function (str) {
                this.send(str.toUpperCase());
            };

            app2.response.shout = function (str) {
                this.send(str);
            };

            app.use((req, res) => {
                res.shout('hey');
            });

            request(app)
                .get('/')
                .expect('HEY', done);
        });
    });
});
