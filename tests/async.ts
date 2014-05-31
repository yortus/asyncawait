import references = require('references');
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import yield_ = require('asyncawait/yield');
var expect = chai.expect;


function runTestsFor(variant?: string, acceptsCallback = false) {
    var name = 'async' + (variant ? ('.' + variant) : '');
    var func = async;
    if (variant) variant.split('.').forEach(prop => func = func[prop]);
    var arity = fn => fn.length + (acceptsCallback ? 1 : 0);

    describe('The ' + name + '(...) function', () => {

        it('throws if not passed a single function', () => {
            expect(() => func.call(func, 1)).to.throw(Error);
            expect(() => func.call(func, 'sss')).to.throw(Error);
            expect(() => func.call(func, ()=>{}, true)).to.throw(Error);
            expect(() => func.call(func, ()=>{}, ()=>{})).to.throw(Error);
        });

        it('synchronously returns a function', () => {
            var foo = func(() => {});
            expect(foo).to.be.a('function');
        });

        it('returns a function whose arity matches that of its definition', () => {
            var defns = [
                () => {},
                (a, b, c, d, e, f, g, h, i, j, k, l, m, n) => {},
                x => {}
            ];
            for (var i = 0; i < defns.length; ++i) {
                var foo = func(defns[i]);
                expect(foo.length).to.equal(arity(defns[i]));
            }
        });
    });
}
runTestsFor(null);
runTestsFor('promise');
runTestsFor('cps', true);
runTestsFor('thunk');
//runTestsFor('stream');
//runTestsFor('express', true);
//runTestsFor('iterable');
//runTestsFor('iterable.promise');
//runTestsFor('iterable.cps');
//runTestsFor('iterable.thunk');


describe('A suspendable function returned by async(...)', () => {

    it('synchronously returns a promise', () => {
        var foo = async (() => {});
        var syncResult = foo();
        expect(syncResult).instanceOf(Promise);
    });

    it('executes its definition asynchronously', done => {
        var x = 5;
        var foo = async (() => { x = 7; });
        (<Promise<any>> foo())
        .then(result => expect(x).to.equal(7))
        .then(() => done())
        .catch(done);
        expect(x).to.equal(5);
    });

    it('eventually resolves with its definition\'s returned value', done => {
        var foo = async (() => { return 'blah'; });
        (<Promise<any>> foo())
        .then(result => expect(result).to.equal('blah'))
        .then(() => done())
        .catch(done);
    });

    it('eventually rejects with its definition\'s thrown value', done => {
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

    it('emits progress with each yielded value', done => {
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
