import references = require('references');
import stream = require('stream');
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import yield_ = require('asyncawait/yield');
var expect = chai.expect;


describe('A suspendable function returned by async.express(...)', () => {

    var foo = async.express ((rq: any, rs: any) => {
        rs.post = rs.pre;
        if (rq instanceof Error) throw rq;
        yield_ (rq);
        return rq;
    });

    function nullFunc() { }

    it('synchronously returns nothing', () => {
        var syncResult = foo(null, null, nullFunc);
        expect(syncResult).to.not.exist;
    });

    it('throws if a callback is not supplied after the other arguments', () => {
        var bar: Function = foo;
        expect(() => bar()).to.throw(Error);
        expect(() => bar(1)).to.throw(Error);
        expect(() => bar('a', 'b')).to.throw(Error);
        expect(() => bar('a', 'b', 'c')).to.throw(Error);
    });

    it('executes its definition asynchronously', done => {
        var rs = { pre: 'abc', post: null };
        Promise.promisify(foo)('next', rs)
        .then(() => expect(rs.post).to.equal('abc'))
        .then(() => done())
        .catch(done);
        expect(rs.pre).to.exist;
    });

    it('eventually rejects if its definition\'s return value is not falsy or \'next\' or \'route\'', done => {
        var err, rs = { pre: 'abc', post: null };
        Promise.promisify(foo)('blah', rs)
        .catch(err_ => err = err_)
        .finally(() => done(err ? null : new Error('Expected function to throw')));
    });

    it('never calls next(...) if its definition\'s return value is falsy', done => {
        var returned, rs = { pre: 'xxx', post: null };
        Promise.promisify(foo)(undefined, rs)
        .finally(() => returned = true);
        Promise.delay(50).then(() => done(returned ? new Error('Expected next(...) to remain uncalled') : null));
    });

    it('eventually calls next() if its definition\'s return value is \'next\'', done => {
        var val, rs = { pre: 'abc', post: null };
        Promise.promisify(foo)('next', rs)
        .then(val_ => val = val_, err => val = err)
        .finally(() => done(!val ? null : new Error('Expected next() to be called')));
    });

    it('eventually calls next(\'route\') if its definition\'s return value is \'route\'', done => {
        var val, err, rs = { pre: 'abc', post: null };
        Promise.promisify(foo)('route', rs)
        .then(val_ => val = val_, err => val = err.message)
        .finally(() => done(val === 'route' ? null : new Error('Expected next(\'route\') to be called')));
    });

    it('eventually rejects with its definition\'s thrown value', done => {
        var act, exp = new Error('Expected thrown value to match rejection value');
        var val, err, rs = { pre: 'abc', post: null };
        Promise.promisify(foo)(exp, rs)
        .catch(err => act = err)
        .finally(() => done(act && act.message === exp.message ? null : exp));
    });

    it('ignores yielded values', done => {
        var yields = [], rs = { pre: 'abc', post: null };
        Promise.promisify(foo)('next', rs)
        .progressed(value => yields.push(value))
        .then(() => expect(yields).to.be.empty)
        .then(() => done())
        .catch(done);
    });
});
