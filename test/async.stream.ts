import references = require('references');
import stream = require('stream');
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import yield_ = require('asyncawait/yield');
var expect = chai.expect;


describe('A suspendable function returned by async.stream(...)', () => {

    var foo = async.stream ((count: number, accum?: any[]) => {
        if (count < 1 || count > 9) throw new Error('out of range');
        for (var i = 1; i <= count; ++i) {
            if (accum) accum.push(111 * i);
            yield_ (111 * i);
        }
        return 'done';
    });

    function nullFunc() { }

    it('synchronously returns a stream', () => {
        var syncResult = foo(3);
        expect(syncResult).instanceOf(stream.Readable);
    });

    it('begins executing synchronously and completes asynchronously', done => {
        var arr = [], items = foo(3, arr);
        items.resume();
        items.on('end', () => { expect(arr).to.deep.equal([111, '***', 222, 333]); done(); });
        expect(arr).to.deep.equal([111]);
        arr.push('***');
    });

    it("preserves the 'this' context of the call", done => {
        var foo = { bar: async.stream (function () { yield_ (this); }) }, baz = {x:7};
        var arr = [], items = foo.bar();
        items.on('data', val => arr.push(val));
        items.on('end', () => {
            items = foo.bar.call(baz);
            items.on('data', val => arr.push(val));
            items.on('end', () => {
                expect(arr).to.deep.equal([foo, baz]);
                done();
            });
        });
    });

    it('eventually emits a \'data\' event for each yielded value', done => {
        var arr = [], items = foo(4);
        items.on('data', val => arr.push(val));
        items.on('end', () => { expect(arr).to.deep.equal([111, 222, 333, 444]); done(); });
    });
    
    it('eventually emits an \'end\' event if no error is thrown', done => {
        var items = foo(7);
        items.on('data', nullFunc);
        items.on('end', () => done());
    });

    it('eventually emits an \'error\' event with its definition\'s thrown value', done => {
        var err, items = foo(20);
        items.on('data', nullFunc);
        items.on('error', err => { expect(err.message).to.equal('out of range'); done(); });
    });

    it('works with await', done => {
        var foo = async.stream (() => { yield_ (await (Promise.delay(20).then(() => 'blah'))); });
        var arr = [], items = foo();
        items.on('data', val => arr.push(val));
        items.on('end', () => {
            expect(arr).to.deep.equal(['blah']);
            done();
        });
    });
});
