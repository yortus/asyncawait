var chai = require('chai');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

var expect = chai.expect;

describe('The await.thunk(...) function', function () {
    it('throws if not called within a suspendable function', function () {
        expect(function () {
            return await.thunk(function () {
            });
        }).to.throw(Error);
    });

    it('suspends the suspendable function until the expression produces a result', function (done) {
        var x = 5;
        var foo = async(function () {
            await.thunk(function (cb) {
                return Promise.delay(40).nodeify(cb);
            });
            x = 7;
            await.thunk(function (cb) {
                return Promise.delay(40).nodeify(cb);
            });
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
            return await.thunk(function (cb) {
                return Promise.delay(20).then(function () {
                    return 'blah';
                }).nodeify(cb);
            });
        });
        foo().then(function (result) {
            return expect(result).to.equal('blah');
        }).then(function () {
            return done();
        }).catch(done);
    });
});
//# sourceMappingURL=await.thunk.js.map
