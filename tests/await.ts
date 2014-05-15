///<reference path="../src/references.ts" />
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import yield_ = require('asyncawait/yield');
var expect = chai.expect;


describe('The await(...) function', () => {

    it('throws if not called within a suspendable function', () => {
        expect(() => await(111)).to.throw(Error);
    });

    it('suspends the suspendable function until the expression produces a result', done => {
        var x = 5;
        var foo = async (() => {
            await (Promise.delay(40));
            x = 7;
            await (Promise.delay(40));
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
        var foo = async (() => await (Promise.delay(20).then(() => 'blah')));
        (<Promise<any>> foo())
        .then(result => expect(result).to.equal('blah'))
        .then(() => done())
        .catch(done);
    });
});
