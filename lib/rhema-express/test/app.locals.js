
const express = require('../');

describe('app', () => {
    describe('.locals(obj)', () => {
        it('should merge locals', () => {
            const app = express();
            Object.keys(app.locals).should.eql(['settings']);
            app.locals.user = 'tobi';
            app.locals.age = 2;
            Object.keys(app.locals).should.eql(['settings', 'user', 'age']);
            app.locals.user.should.equal('tobi');
            app.locals.age.should.equal(2);
        });
    });

    describe('.locals.settings', () => {
        it('should expose app settings', () => {
            const app = express();
            app.set('title', 'House of Manny');
            const obj = app.locals.settings;
            obj.should.have.property('env', 'test');
            obj.should.have.property('title', 'House of Manny');
        });
    });
});
