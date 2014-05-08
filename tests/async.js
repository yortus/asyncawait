///<reference path="../src/_refs.d.ts" />
var chai = require('chai');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var yield_ = require('asyncawait/yield');
var expect = chai.expect;

describe('The async(...) function', function () {
    it('should throw if not passed a single function', function () {
        expect(function () {
            return async.call(async, 1);
        }).to.throw(Error);
        expect(function () {
            return async.call(async, 'sss');
        }).to.throw(Error);
        expect(function () {
            return async.call(async, function () {
            }, true);
        }).to.throw(Error);
        expect(function () {
            return async.call(async, function () {
            }, function () {
            });
        }).to.throw(Error);
    });

    it('should synchronously return a function', function () {
        var foo = async(function () {
        });
        expect(foo).to.be.a('function');
    });

    it('should return a function with the same arity as the function passed to it', function () {
        var foo = async(function () {
        });
        var bar = async(function (a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
        });
        var baz = async(function (x) {
        });
        expect(foo.length).to.equal(0);
        expect(bar.length).to.equal(14);
        expect(baz.length).to.equal(1);
    });
});

describe('A suspendable function returned by async(...)', function () {
    it('should synchronously return a promise', function () {
        var foo = async(function () {
        });
        var promise = foo();
        expect(promise).instanceOf(Promise);
    });

    it('should execute its definition asynchronously', function (done) {
        var x = 5;
        var foo = async(function () {
            x = 7;
        });
        foo().then(function (result) {
            return expect(x).to.equal(7);
        }).then(function () {
            return done();
        }).catch(done);
        expect(x).to.equal(5);
    });

    it('should eventually resolve with its definition\'s returned value', function (done) {
        var foo = async(function () {
            return 'blah';
        });
        foo().then(function (result) {
            return expect(result).to.equal('blah');
        }).then(function () {
            return done();
        }).catch(done);
    });

    it('should eventually reject with its definition\s thrown value', function (done) {
        var act, exp = new Error('Expected thrown value to match rejection value');
        var foo = async(function () {
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

    it('should emit progress with each yielded value', function (done) {
        var foo = async(function () {
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
//# sourceMappingURL=async.js.map
