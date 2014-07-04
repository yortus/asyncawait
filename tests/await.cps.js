var chai = require('chai');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

var expect = chai.expect;
var __ = await.cps;

describe('The await.cps(...) function', function () {
    it('throws if not called within a suspendable function', function () {
        expect(function () {
            return await.cps(111);
        }).to.throw(Error);
    });

    it('suspends the suspendable function until the expression produces a result', function (done) {
        var x = 5;
        var delay = function (n, callback) {
            Promise.delay(n).nodeify(callback);
        };
        var foo = async(function () {
            await.cps(delay(40, __.__));
            x = 7;
            await.cps(delay(40, __.__));
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
        var delay = function (n, callback) {
            Promise.delay(n).nodeify(callback);
        };
        var foo = async(function () {
            await.cps(delay(20, __.__));
            return 'blah';
        });
        foo().then(function (result) {
            return expect(result).to.equal('blah');
        }).then(function () {
            return done();
        }).catch(function (err) {
            console.log('xxxxxxxxxxxxx');
            done(err);
        });
    });
});
//# sourceMappingURL=await.cps.js.map
