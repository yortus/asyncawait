import references = require('references');
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import yield_ = require('asyncawait/yield');
var expect = chai.expect;


describe('A suspendable function returned by async.cps(...)', () => {

    it('synchronously returns nothing', () => {
        var foo = async.cps (() => {});
        var syncResult = foo(()=>{});
        expect(syncResult).to.not.exist;
    });

    it('throws if a callback is not supplied after the other arguments', () => {
        var foo: Function = async.cps (() => {});
        var bar: Function = async.cps ((a, b) => {});

        expect(() => foo()).to.throw(Error);
        expect(() => foo(1)).to.throw(Error);
        expect(() => bar()).to.throw(Error);
        expect(() => bar(1, 2)).to.throw(Error);
        expect(() => bar(1, 2, 3)).to.throw(Error);
    });

    it('executes its definition asynchronously', done => {
        var x = 5;
        var foo = async.cps (() => { x = 7; });
        Promise.promisify(foo)()
        .then(result => expect(x).to.equal(7))
        .then(() => done())
        .catch(done);
        expect(x).to.equal(5);
    });

    it('eventually resolves with its definition\'s returned value', done => {
        var foo = async.cps (() => { return 'blah'; });
        Promise.promisify(foo)()
        .then(result => expect(result).to.equal('blah'))
        .then(() => done())
        .catch(done);
    });

    it('eventually rejects with its definition\'s thrown value', done => {
        var act, exp = new Error('Expected thrown value to match rejection value');
        var foo = async.cps (() => { throw exp; return 'blah'; });
        Promise.promisify(foo)()
        .catch(err => act = err)
        .then(() => {
            if (!act) done(new Error("Expected function to throw"))
            else if (act.message !== exp.message) done(exp);
            else done();
        });
    });

    it('ignores yielded values', done => {
        var foo = async.cps (() => { yield_(111); yield_(222); yield_(333); return 444; });
        var yields = [];
        Promise.promisify(foo)()
        .progressed(value => yields.push(value))
        .then(result => expect(result).to.equal(444))
        .then(() => expect(yields).to.be.empty)
        .then(() => done())
        .catch(done);
    });
});
