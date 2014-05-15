var chai = require('chai');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var yield_ = require('asyncawait/yield');
var expect = chai.expect;

describe('A suspendable function returned by async.promise(...)', function () {
    it('synchronously returns a promise', function () {
        var foo = async.promise(function () {
        });
        var syncResult = foo();
        expect(syncResult).instanceOf(Promise);
    });

    it('executes its definition asynchronously', function (done) {
        var x = 5;
        var foo = async.promise(function () {
            x = 7;
        });
        foo().then(function (result) {
            return expect(x).to.equal(7);
        }).then(function () {
            return done();
        }).catch(done);
        expect(x).to.equal(5);
    });

    it('eventually resolves with its definition\'s returned value', function (done) {
        var foo = async.promise(function () {
            return 'blah';
        });
        foo().then(function (result) {
            return expect(result).to.equal('blah');
        }).then(function () {
            return done();
        }).catch(done);
    });

    it('eventually rejects with its definition\'s thrown value', function (done) {
        var act, exp = new Error('Expected thrown value to match rejection value');
        var foo = async.promise(function () {
            throw exp;
            return 'blah';
        });
        foo().catch(function (err) {
            return act = err;
        }).then(function () {
            if (!act)
                done(new Error("Expected function to throw"));
            else if (act !== exp)
                done(exp);
            else
                done();
        });
    });

    it('emits progress with each yielded value', function (done) {
        var foo = async.promise(function () {
            yield_(111);
            yield_(222);
            yield_(333);
            return 444;
        });
        var yields = [];
        foo().progressed(function (value) {
            return yields.push(value);
        }).then(function (result) {
            return expect(result).to.equal(444);
        }).then(function () {
            return expect(yields).to.deep.equal([111, 222, 333]);
        }).then(function () {
            return done();
        }).catch(done);
    });
});
//# sourceMappingURL=async.promise.js.map
