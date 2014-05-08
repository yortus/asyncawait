///<reference path="../src/_refs.d.ts" />
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import yield_ = require('asyncawait/yield');
var expect = chai.expect;


function runTestsFor(variant?: string) {
    var name = 'async' + (variant ? ('.' + variant) : '');
    var func = variant ? async[variant] : async;
    var arityFor = fn => fn.length + (variant === 'cps' ? 1 : 0);

    describe('The ' + name + '(...) function', () => {

        it('should throw if not passed a single function', () => {
            expect(() => func.call(func, 1)).to.throw(Error);
            expect(() => func.call(func, 'sss')).to.throw(Error);
            expect(() => func.call(func, ()=>{}, true)).to.throw(Error);
            expect(() => func.call(func, ()=>{}, ()=>{})).to.throw(Error);
        });

        it('should synchronously return a function', () => {
            var foo = func(() => {});
            expect(foo).to.be.a('function');
        });

        it('should return a function whose arity matches that of its definition', () => {
            var defns = [
                () => {},
                (a, b, c, d, e, f, g, h, i, j, k, l, m, n) => {},
                x => {}
            ];
            for (var i = 0; i < defns.length; ++i) {
                var foo = func(defns[i]);
                expect(foo.length).to.equal(arityFor(defns[i]));
            }
        });
    });
}
runTestsFor(null);
runTestsFor('cps');
runTestsFor('thunk');
runTestsFor('result');
//TODO:...
//runTestsFor('stream');
runTestsFor('iterable');
//runTestsFor('iterable.cps');
//runTestsFor('iterable.thunk');
//runTestsFor('iterable.result');


describe('A suspendable function returned by async(...)', () => {

    it('should synchronously return a promise', () => {
        var foo = async (() => {});
        var syncResult = foo();
        expect(syncResult).instanceOf(Promise);
    });

    it('should execute its definition asynchronously', done => {
        var x = 5;
        var foo = async (() => { x = 7; });
        (<Promise<any>> foo())
        .then(result => expect(x).to.equal(7))
        .then(() => done())
        .catch(done);
        expect(x).to.equal(5);
    });

    it('should eventually resolve with its definition\'s returned value', done => {
        var foo = async (() => { return 'blah'; });
        (<Promise<any>> foo())
        .then(result => expect(result).to.equal('blah'))
        .then(() => done())
        .catch(done);
    });

    it('should eventually reject with its definition\'s thrown value', done => {
        var act, exp = new Error('Expected thrown value to match rejection value');
        var foo = async (() => { throw exp; return 'blah'; });
        (<Promise<any>> foo())
        .catch(err => act = err)
        .then(() => {
            if (!act) done(new Error("Expected function to throw"))
            else if (act !== exp) done(exp);
            else done();
        });
    });

    it('should emit progress with each yielded value', done => {
        var foo = async (() => { yield_(111); yield_(222); yield_(333); return 444; });
        var yields = [];
        (<Promise<any>> foo())
        .progressed(value => yields.push(value))
        .then(result => expect(result).to.equal(444))
        .then(() => expect(yields).to.deep.equal([111,222,333]))
        .then(() => done())
        .catch(done);
    });
});
