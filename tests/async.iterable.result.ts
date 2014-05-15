///<reference path="../src/references.ts" />
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import yield_ = require('asyncawait/yield');
var expect = chai.expect;


describe('async.iterable.result(...)', () => {

    var foo = async.iterable.result ((count: number, accum?: any[]) => {
        if (count < 1 || count > 9) throw new Error('out of range');
        for (var i = 1; i <= count; ++i) {
            if (accum) accum.push(111 * i);
            yield_ (111 * i);
        }
        return 'done';
    });


    describe('returns a function', () => {

        it('which returns an async iterator with next() and forEach() methods', () => {
            var syncResult = foo();
            expect(syncResult).is.an('object');
            expect(syncResult.next).is.a('function');
            expect(syncResult.forEach).is.a('function');
        });
    });


    describe('provides an iterator whose next() method', () => {

        it('throws if called outside a suspendable function', () => {
            var iter = foo(3);
            expect(() => iter.next()).to.throw(Error);
        });

        it('pseudo-synchronously returns with the definition\'s yielded value', async.cps (() => {
            var iter = foo(3);
            expect(iter.next()).to.deep.equal({ done: false, value: 111 });
            expect(iter.next()).to.deep.equal({ done: false, value: 222 });
            expect(iter.next()).to.deep.equal({ done: false, value: 333 });
            expect(iter.next()).to.deep.equal({ done: true, value: 'done' });
        }));

        it('pseudo-synchronously throws with the definition\'s thrown value', async.cps (() => {
            var err, iter = foo(20);
            expect(() => iter.next()).to.throw(Error, 'out of range');
        }));

        it('pseudo-synchronously throws if the iteration is already finished', async.cps(() => {
            var err, iter = foo(1);
            expect(iter.next()).to.deep.equal({ done: false, value: 111 });
            expect(iter.next()).to.deep.equal({ done: true, value: 'done' });
            expect(() => iter.next()).to.throw(Error);
        }));
    });


    describe('provides an iterator whose forEach() method', () => {

        function nullFunc() { }

        it('throws if called outside a suspendable function', () => {
            var iter = foo(3);
            expect(() => iter.forEach(nullFunc)).to.throw(Error);
        });

        it('expects a callback as its first argument', () => {
            expect(() => (<any> foo(3)).forEach()).to.throw(Error);
            expect(() => (<any> foo(3)).forEach(1)).to.throw(Error);
            expect(() => (<any> foo(3)).forEach(1, nullFunc)).to.throw(Error);
        });

        it('iterates over all yielded values', async.cps(() => {
            var arr = [], iter = foo(4);
            iter.forEach(val => arr.push(val));
            expect(arr).to.deep.equal([111, 222, 333, 444]);
        }));

        it('pseudo-synchronously returns with the definition\'s returned value', async.cps(() => {
            var arr = [], iter = foo(7, arr);
            var result = iter.forEach(nullFunc);
            expect(result).to.equal('done');
            expect(arr.length).to.equal(7);
        }));

        it('pseudo-synchronously throws with the definition\'s thrown value', async.cps(() => {
            var err, iter = foo(20);
            expect(() => iter.forEach(nullFunc)).to.throw(Error, 'out of range');
        }));

        it('pseudo-synchronously throws if the iteration is already finished', async.cps(() => {
            var err, iter = foo(1);
            iter.forEach(nullFunc);
            expect (() => iter.forEach(nullFunc)).to.throw(Error);
        }));
    });
});
