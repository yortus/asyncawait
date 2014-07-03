import references = require('references');
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import yield_ = require('asyncawait/yield');
var expect = chai.expect;


describe('The await.promise(...) function', () => {

    it('throws if not called within a suspendable function', () => {
        expect(() => await.promise (111)).to.throw(Error);
    });

    it('suspends the suspendable function until the expression produces a result', done => {
        var x = 5;
        var foo = async (() => {
            await.promise (Promise.delay(40));
            x = 7;
            await.promise (Promise.delay(40));
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
        var foo = async (() => await.promise (Promise.delay(20).then(() => 'blah')));
        foo()
        .then(result => expect(result).to.equal('blah'))
        .then(() => done())
        .catch(done);
    });
});
