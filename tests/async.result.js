///<reference path="../src/_refs.d.ts" />
var chai = require('chai');

var async = require('asyncawait/async');
var yield_ = require('asyncawait/yield');
var expect = chai.expect;

describe('A suspendable function returned by async.result(...)', function () {
    it('should throw if called outside a suspendable function', function () {
        var foo = async.result(function () {
        });
        expect(function () {
            return foo();
        }).to.throw(Error);
    });

    it('should pseudo-synchronously return with its definition\'s returned value', function (done) {
        var foo = async.result(function () {
            return 'blah';
        });
        var bar = async(function () {
            expect(foo()).to.equal('blah');
        });
        bar().then(function () {
            return done();
        }, done);
    });

    it('should pseudo-synchronously throw with its definition\'s thrown value', function (done) {
        var exp = new Error('Expected thrown value to match rejection value');
        var foo = async.result(function () {
            throw exp;
            return 'blah';
        });
        var bar = async(function () {
            try  {
                foo();
            } catch (err) {
                if (err !== exp)
                    throw exp;
                return;
            }
            throw new Error("Expected function to throw");
        });
        bar().then(function () {
            return done();
        }, done);
    });

    it('should ignore yielded values', function (done) {
        var foo = async.result(function () {
            yield_(111);
            yield_(222);
            yield_(333);
            return 444;
        });
        var bar = async(function () {
            expect(foo()).to.equal(444);
        });
        bar().then(function () {
            return done();
        }, done);
    });
});
//# sourceMappingURL=async.result.js.map
