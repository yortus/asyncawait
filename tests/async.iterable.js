///<reference path="../src/_refs.d.ts" />
var chai = require('chai');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var yield_ = require('asyncawait/yield');
var expect = chai.expect;

describe('async.iterable(...)', function () {
    var foo = async.iterable(function (count, accum) {
        if (count < 1 || count > 9)
            throw new Error('out of range');
        for (var i = 1; i <= count; ++i) {
            if (accum)
                accum.push(111 * i);
            yield_(111 * i);
        }
        return 'done';
    });

    describe('returns a function', function () {
        it('which returns an AsyncIterator with next() and forEach() methods', function () {
            var foo = async.iterable(function () {
            });
            var syncResult = foo();
            expect(syncResult).is.an('object');
            expect(syncResult.next).is.a('function');
            expect(syncResult.forEach).is.a('function');
        });
    });

    describe('provides an AsyncIterator whose next() method', function () {
        it('synchronously returns a promise', function () {
            var iter = foo(3);
            expect(iter.next()).instanceOf(Promise);
        });

        it('executes its definition asynchronously', function (done) {
            var arr = [], iter = foo(3, arr);
            iter.next().then(function (result) {
                return expect(arr).to.deep.equal([111]);
            }).then(function () {
                return done();
            }).catch(done);
            expect(arr).to.be.empty;
        });

        it('eventually resolves with the definition\'s yielded value', function (done) {
            var iter = foo(3);
            iter.next().then(function (result) {
                return expect(result).to.deep.equal({ done: false, value: 111 });
            }).then(function (result) {
                return iter.next();
            }).then(function (result) {
                return expect(result).to.deep.equal({ done: false, value: 222 });
            }).then(function (result) {
                return iter.next();
            }).then(function (result) {
                return expect(result).to.deep.equal({ done: false, value: 333 });
            }).then(function (result) {
                return iter.next();
            }).then(function (result) {
                return expect(result).to.deep.equal({ done: true, value: 'done' });
            }).then(function () {
                return done();
            }).catch(done);
        });

        it('eventually rejects with the definition\'s thrown value', function (done) {
            var err, iter = foo(20);
            iter.next().catch(function (err_) {
                return err = err_;
            }).then(function () {
                if (!err)
                    done(new Error("Expected function to throw"));
                else if (err.message === 'out of range')
                    done();
                else
                    done(new Error('Expected thrown value to match rejection value'));
            });
        });

        it('eventually rejects if the iteration is already finished', function (done) {
            var err, iter = foo(1);
            iter.next().then(function (result) {
                return expect(result).to.deep.equal({ done: false, value: 111 });
            }).then(function (result) {
                return iter.next();
            }).then(function (result) {
                return expect(result).to.deep.equal({ done: true, value: 'done' });
            }).then(function (result) {
                return iter.next();
            }).catch(function (err_) {
                return err = err_;
            }).then(function () {
                return done(err ? null : new Error("Expected function to throw"));
            });
        });
    });

    describe('provides an AsyncIterator whose forEach() method', function () {
        it('expects a single callback as its argument', function () {
            expect(function () {
                return foo(3).forEach();
            }).to.throw(Error);
            expect(function () {
                return foo(3).forEach(1);
            }).to.throw(Error);
            expect(function () {
                return foo(3).forEach(1, function () {
                });
            }).to.throw(Error);
        });

        it('synchronously returns a promise', function () {
            var iter = foo(3);
            expect(iter.forEach(function () {
            })).instanceOf(Promise);
        });

        it('executes its definition asynchronously', function (done) {
            var arr = [], iter = foo(3, arr);
            iter.forEach(function () {
            }).then(function (result) {
                return expect(arr).to.deep.equal([111, 222, 333]);
            }).then(function () {
                return done();
            }).catch(done);
            expect(arr).to.be.empty;
        });

        it('iterates over all yielded values', function (done) {
            var arr = [], iter = foo(4);
            iter.forEach(function (val) {
                return arr.push(val);
            }).then(function (result) {
                return expect(arr).to.deep.equal([111, 222, 333, 444]);
            }).then(function () {
                return done();
            }).catch(done);
        });

        it('eventually resolves with the definition\'s returned value', function (done) {
            var arr = [], iter = foo(7, arr);
            iter.forEach(function () {
            }).then(function (result) {
                return expect(result).to.equal('done');
            }).then(function (result) {
                return expect(arr.length).to.equal(7);
            }).then(function () {
                return done();
            }).catch(done);
        });

        it('eventually rejects with the definition\'s thrown value', function (done) {
            var err, iter = foo(20);
            iter.forEach(function () {
            }).catch(function (err_) {
                return err = err_;
            }).then(function () {
                if (!err)
                    done(new Error("Expected function to throw"));
                else if (err.message === 'out of range')
                    done();
                else
                    done(new Error('Expected thrown value to match rejection value'));
            });
        });

        it('eventually rejects if the iteration is already finished', function (done) {
            var err, iter = foo(3);
            iter.forEach(function () {
            }).then(function () {
                return iter.forEach(function () {
                });
            }).catch(function (err_) {
                return err = err_;
            }).then(function () {
                return done(err ? null : new Error("Expected function to throw"));
            });
        });
    });
});
//# sourceMappingURL=async.iterable.js.map
