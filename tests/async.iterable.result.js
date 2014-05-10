///<reference path="../src/_refs.d.ts" />
var chai = require('chai');

var async = require('asyncawait/async');

var yield_ = require('asyncawait/yield');
var expect = chai.expect;

describe('async.iterable.result(...)', function () {
    var foo = async.iterable.result(function (count, accum) {
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
        it('which returns an async iterator with next() and forEach() methods', function () {
            var syncResult = foo();
            expect(syncResult).is.an('object');
            expect(syncResult.next).is.a('function');
            expect(syncResult.forEach).is.a('function');
        });
    });

    describe('provides an iterator whose next() method', function () {
        it('throws if called outside a suspendable function', function () {
            var iter = foo(3);
            expect(function () {
                return iter.next();
            }).to.throw(Error);
        });

        it('pseudo-synchronously returns with the definition\'s yielded value', async.cps(function () {
            var iter = foo(3);
            expect(iter.next()).to.deep.equal({ done: false, value: 111 });
            expect(iter.next()).to.deep.equal({ done: false, value: 222 });
            expect(iter.next()).to.deep.equal({ done: false, value: 333 });
            expect(iter.next()).to.deep.equal({ done: true, value: 'done' });
        }));

        it('pseudo-synchronously throws with the definition\'s thrown value', async.cps(function () {
            var err, iter = foo(20);
            expect(function () {
                return iter.next();
            }).to.throw(Error, 'out of range');
        }));

        it('pseudo-synchronously throws if the iteration is already finished', async.cps(function () {
            var err, iter = foo(1);
            expect(iter.next()).to.deep.equal({ done: false, value: 111 });
            expect(iter.next()).to.deep.equal({ done: true, value: 'done' });
            expect(function () {
                return iter.next();
            }).to.throw(Error);
        }));
    });

    describe('provides an iterator whose forEach() method', function () {
        function nullFunc() {
        }

        it('throws if called outside a suspendable function', function () {
            var iter = foo(3);
            expect(function () {
                return iter.forEach(nullFunc);
            }).to.throw(Error);
        });

        it('expects a callback as its first argument', function () {
            expect(function () {
                return foo(3).forEach();
            }).to.throw(Error);
            expect(function () {
                return foo(3).forEach(1);
            }).to.throw(Error);
            expect(function () {
                return foo(3).forEach(1, nullFunc);
            }).to.throw(Error);
        });

        it('iterates over all yielded values', async.cps(function () {
            var arr = [], iter = foo(4);
            iter.forEach(function (val) {
                return arr.push(val);
            });
            expect(arr).to.deep.equal([111, 222, 333, 444]);
        }));

        it('pseudo-synchronously returns with the definition\'s returned value', async.cps(function () {
            var arr = [], iter = foo(7, arr);
            var result = iter.forEach(nullFunc);
            expect(result).to.equal('done');
            expect(arr.length).to.equal(7);
        }));

        it('pseudo-synchronously throws with the definition\'s thrown value', async.cps(function () {
            var err, iter = foo(20);
            expect(function () {
                return iter.forEach(nullFunc);
            }).to.throw(Error, 'out of range');
        }));

        it('pseudo-synchronously throws if the iteration is already finished', async.cps(function () {
            var err, iter = foo(1);
            iter.forEach(nullFunc);
            expect(function () {
                return iter.forEach(nullFunc);
            }).to.throw(Error);
        }));
    });
});
//# sourceMappingURL=async.iterable.result.js.map
