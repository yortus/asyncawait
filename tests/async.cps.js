///<reference path="../src/_refs.d.ts" />
var chai = require('chai');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var yield_ = require('asyncawait/yield');
var expect = chai.expect;

describe('A suspendable function returned by async.cps(...)', function () {
    it('should synchronously return nothing', function () {
        var foo = async.cps(function () {
        });
        var syncResult = foo(function () {
        });
        expect(syncResult).to.not.exist;
    });

    it('should throw if a callback is not supplied after the other arguments', function () {
        var foo = async.cps(function () {
        });
        var bar = async.cps(function (a, b) {
        });

        expect(function () {
            return foo();
        }).to.throw(Error);
        expect(function () {
            return foo(1);
        }).to.throw(Error);
        expect(function () {
            return bar();
        }).to.throw(Error);
        expect(function () {
            return bar(1, 2);
        }).to.throw(Error);
        expect(function () {
            return bar(1, 2, 3);
        }).to.throw(Error);
    });

    it('should execute its definition asynchronously', function (done) {
        var x = 5;
        var foo = async.cps(function () {
            x = 7;
        });
        Promise.promisify(foo)().then(function (result) {
            return expect(x).to.equal(7);
        }).then(function () {
            return done();
        }).catch(done);
        expect(x).to.equal(5);
    });

    it('should eventually resolve with its definition\'s returned value', function (done) {
        var foo = async.cps(function () {
            return 'blah';
        });
        Promise.promisify(foo)().then(function (result) {
            return expect(result).to.equal('blah');
        }).then(function () {
            return done();
        }).catch(done);
    });

    it('should eventually reject with its definition\'s thrown value', function (done) {
        var act, exp = new Error('Expected thrown value to match rejection value');
        var foo = async.cps(function () {
            throw exp;
            return 'blah';
        });
        Promise.promisify(foo)().catch(function (err) {
            return act = err;
        }).then(function () {
            if (!act)
                done(new Error("Expected function to throw"));
            else if (act.message !== exp.message)
                done(exp);
            else
                done();
        });
    });

    it('should ignore yielded values', function (done) {
        var foo = async.cps(function () {
            yield_(111);
            yield_(222);
            yield_(333);
            return 444;
        });
        var yields = [];
        Promise.promisify(foo)().progressed(function (value) {
            return yields.push(value);
        }).then(function (result) {
            return expect(result).to.equal(444);
        }).then(function () {
            return expect(yields).to.deep.equal([]);
        }).then(function () {
            return done();
        }).catch(done);
    });
});
//# sourceMappingURL=async.cps.js.map
