///<reference path="../src/_refs.d.ts" />
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import yield_ = require('asyncawait/yield');
var expect = chai.expect;


describe('async.iterable(...)', () => {

    var foo = async.iterable ((count: number, accum?: any[]) => {
        if (count < 1 || count > 9) throw new Error('out of range');
        for (var i = 1; i <= count; ++i) {
            if (accum) accum.push(111 * i);
            yield_ (111 * i);
        }
        return 'done';
    });

    describe('returns a function', () => {

        it('which returns an AsyncIterator with next() and forEach() methods', () => {
            var foo = async.iterable (() => {});
            var syncResult = foo();
            expect(syncResult).is.an('object');
            expect(syncResult.next).is.a('function');
            expect(syncResult.forEach).is.a('function');
        });
    });


    describe('provides an AsyncIterator whose next() method', () => {

        it('synchronously returns a promise', () => {
            var iter = foo(3);
            expect(iter.next()).instanceOf(Promise);
        });

        it('executes its definition asynchronously', done => {
            var arr = [], iter = foo(3, arr);
            (<Promise<any>> iter.next())
            .then(result => expect(arr).to.deep.equal([111]))
            .then(() => done())
            .catch(done);
            expect(arr).to.be.empty;
        });

        it('eventually resolves with the definition\'s yielded value', done => {
            var iter = foo(3);
            (<Promise<any>> iter.next())
            .then(result => expect(result).to.deep.equal({ done: false, value: 111 }))
            .then(result => iter.next())
            .then(result => expect(result).to.deep.equal({ done: false, value: 222 }))
            .then(result => iter.next())
            .then(result => expect(result).to.deep.equal({ done: false, value: 333 }))
            .then(result => iter.next())
            .then(result => expect(result).to.deep.equal({ done: true, value: 'done' }))
            .then(() => done())
            .catch(done);
        });

        it('eventually rejects with the definition\'s thrown value', done => {
            var err, iter = foo(20);
            (<Promise<any>> iter.next())
            .catch(err_ => err = err_)
            .then(() => {
                if (!err) done(new Error("Expected function to throw"))
                else if (err.message === 'out of range') done();
                else done(new Error('Expected thrown value to match rejection value'));
            });
        });

        it('eventually rejects if the iteration is already finished', done => {
            var err, iter = foo(1);
            (<Promise<any>> iter.next())
            .then(result => expect(result).to.deep.equal({ done: false, value: 111 }))
            .then(result => iter.next())
            .then(result => expect(result).to.deep.equal({ done: true, value: 'done' }))
            .then(result => iter.next())
            .catch(err_ => err = err_)
            .then(() => done(err ? null : new Error("Expected function to throw")));
        });
    });


    describe('provides an AsyncIterator whose forEach() method', () => {

        it('expects a single callback as its argument', () => {
            expect(() => (<any> foo(3)).forEach()).to.throw(Error);
            expect(() => (<any> foo(3)).forEach(1)).to.throw(Error);
            expect(() => (<any> foo(3)).forEach(1, () => {})).to.throw(Error);
        });

        it('synchronously returns a promise', () => {
            var iter = foo(3);
            expect(iter.forEach(() => {})).instanceOf(Promise);
        });

        it('executes its definition asynchronously', done => {
            var arr = [], iter = foo(3, arr);
            (<Promise<any>> iter.forEach(()=>{}))
            .then(result => expect(arr).to.deep.equal([111, 222, 333]))
            .then(() => done())
            .catch(done);
            expect(arr).to.be.empty;
        });

        it('iterates over all yielded values', done => {
            var arr = [], iter = foo(4);
            (<Promise<any>> iter.forEach(val => arr.push(val)))
            .then(result => expect(arr).to.deep.equal([111, 222, 333, 444]))
            .then(() => done())
            .catch(done);
        });

        it('eventually resolves with the definition\'s returned value', done => {
            var arr = [], iter = foo(7, arr);
            (<Promise<any>> iter.forEach(()=>{}))
            .then(result => expect(result).to.equal('done'))
            .then(result => expect(arr.length).to.equal(7))
            .then(() => done())
            .catch(done);
        });

        it('eventually rejects with the definition\'s thrown value', done => {
            var err, iter = foo(20);
            (<Promise<any>> iter.forEach(()=>{}))
            .catch(err_ => err = err_)
            .then(() => {
                if (!err) done(new Error("Expected function to throw"))
                else if (err.message === 'out of range') done();
                else done(new Error('Expected thrown value to match rejection value'));
            });
        });

        it('eventually rejects if the iteration is already finished', done => {
            var err, iter = foo(3);
            (<Promise<any>> iter.forEach(()=>{}))
            .then(() => iter.forEach(()=>{}))
            .catch(err_ => err = err_)
            .then(() => done(err ? null : new Error("Expected function to throw")));
        });
    });
});
