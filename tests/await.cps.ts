import references = require('references');
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import yield_ = require('asyncawait/yield');
var expect = chai.expect;
if (!global.___) Object.defineProperty(global, '___', { get: () => await.cps.contd() });
declare var ___;



describe('The await.cps(...) function', () => {

    it('throws if not called within a suspendable function', () => {
        expect(() => await.cps (111)).to.throw(Error);
    });

    it('suspends the suspendable function until the expression produces a result', done => {
        var x = 5;
        var delay = (n, callback) => { Promise.delay(n).nodeify(callback); }
        var foo = async (() => {
            await.cps (delay(40, ___));
            x = 7;
            await.cps (delay(40, ___));
            x = 9;
        });
        foo();
        Promise.delay(20)
        .then(() => expect(x).to.equal(5))
        .then(() => Promise.delay(40))
        .then(() => expect(x).to.equal(7))
        .then(() => Promise.delay(40))
        .then(() => expect(x).to.equal(9))
        .then(() => done())
        .catch(done);
        expect(x).to.equal(5);
    });

    it('resumes the suspendable function with the value of the awaited expression', done => {
        var delay = (n, callback) => { Promise.delay(n).nodeify(callback); }
        var foo = async (() => {
            await.cps (delay(20, ___));
            return 'blah';
        });
        foo()
        .then(result => expect(result).to.equal('blah'))
        .then(() => done())
        .catch(err => {
            console.log('xxxxxxxxxxxxx');
            done(err);
            
        });
    });
});
