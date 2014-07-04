var chai = require('chai');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

var expect = chai.expect;

describe('The await.promise(...) function', function () {
    it('throws if not called within a suspendable function', function () {
        expect(function () {
            return await.promise(Promise.delay(20));
        }).to.throw(Error);
    });

    it('suspends the suspendable function until the expression produces a result', function (done) {
        var x = 5;
        var foo = async(function () {
            await.promise(Promise.delay(40));
            x = 7;
            await.promise(Promise.delay(40));
            x = 9;
        });
        foo();
        Promise.delay(20).then(function () {
            return expect(x).to.equal(5);
        }).then(function () {
            return Promise.delay(40);
        }).then(function () {
            return expect(x).to.equal(7);
        }).then(function () {
            return Promise.delay(40);
        }).then(function () {
            return expect(x).to.equal(9);
        }).then(function () {
            return done();
        }).catch(done);
        expect(x).to.equal(5);
    });

    it('resumes the suspendable function with the value of the awaited expression', function (done) {
        var foo = async(function () {
            return await.promise(Promise.delay(20).then(function () {
                return 'blah';
            }));
        });
        foo().then(function (result) {
            return expect(result).to.equal('blah');
        }).then(function () {
            return done();
        }).catch(done);
    });
});
//# sourceMappingURL=await.promise.js.map
