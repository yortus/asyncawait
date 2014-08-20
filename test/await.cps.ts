import references = require('references');
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import yield_ = require('asyncawait/yield');
var expect = chai.expect;
var cont = await.continuation;



describe('The await.cps(...) function', () => {

    it('throws if not called within a suspendable function', () => {
        expect(() => await.cps (undefined)).to.throw(Error);
    });

    it('suspends the suspendable function until the expression produces a result', done => {
        var x = 5;
        var delay = (n, callback) => { Promise.delay(n).nodeify(callback); }
        var foo = async (() => {
            await.cps (delay(40, cont()));
            x = 7;
            await.cps (delay(40, cont()));
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
            await.cps (delay(20, cont()));
            return 'blah';
        });
        foo()
        .then(result => expect(result).to.equal('blah'))
        .then(() => done())
        .catch(done);
    });
});
