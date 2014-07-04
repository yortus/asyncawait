var chai = require('chai');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var yield_ = require('asyncawait/yield');
var expect = chai.expect;

function runTestsFor(variant, acceptsCallback) {
    if (typeof acceptsCallback === "undefined") { acceptsCallback = false; }
    var name = 'async' + (variant ? ('.' + variant) : '');
    var func = async;
    if (variant)
        variant.split('.').forEach(function (prop) {
            return func = func[prop];
        });
    var arity = function (fn) {
        return fn.length + (acceptsCallback ? 1 : 0);
    };

    describe('The ' + name + '(...) function', function () {
        it('throws if not passed a single function', function () {
            expect(function () {
                return func.call(func, 1);
            }).to.throw(Error);
            expect(function () {
                return func.call(func, 'sss');
            }).to.throw(Error);
            expect(function () {
                return func.call(func, function () {
                }, true);
            }).to.throw(Error);
            expect(function () {
                return func.call(func, function () {
                }, function () {
                });
            }).to.throw(Error);
        });

        it('synchronously returns a function', function () {
            var foo = func(function () {
            });
            expect(foo).to.be.a('function');
        });

        it('returns a function whose arity matches that of its definition', function () {
            var defns = [
                function () {
                },
                function (a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
                },
                function (x) {
                }
            ];
            for (var i = 0; i < defns.length; ++i) {
                var foo = func(defns[i]);
                expect(foo.length).to.equal(arity(defns[i]));
            }
        });

        it('has an options property that matches the passed-in options', function () {
            var func2 = func.mod({ special: 777 });
            expect(func2.options).to.exist;
            expect(func2.options['special']).to.equal(777);
            var func2 = func.mod({ other: 'blah' });
            expect(func2.options['special']).to.not.exist;
        });

        it('has a protocol property that matches the passed-in protocol', function () {
            var invoke = function (co, arg) {
                return 'blah';
            };
            var func2 = func.mod(function () {
                return ({ invoke: invoke });
            });
            expect(func2.protocol).to.exist;
            expect(func2.protocol.invoke).to.equal(invoke);
            var func3 = func.mod({ a: 1 });
            expect(func3.protocol).to.exist;
            expect(func3.protocol.invoke).to.not.equal(invoke);
        });
    });
}
runTestsFor(null);
runTestsFor('promise');
runTestsFor('cps', true);
runTestsFor('thunk');
runTestsFor('stream');
runTestsFor('express', true);
runTestsFor('iterable');
runTestsFor('iterable.promise');
runTestsFor('iterable.cps');
runTestsFor('iterable.thunk');

describe('A suspendable function returned by async(...)', function () {
    it('synchronously returns a promise', function () {
        var foo = async(function () {
        });
        var syncResult = foo();
        expect(syncResult).instanceOf(Promise);
    });

    it('executes its definition asynchronously', function (done) {
        var x = 5;
        var foo = async(function () {
            x = 7;
        });
        foo().then(function (result) {
            return expect(x).to.equal(7);
        }).then(function () {
            return done();
        }).catch(done);
        expect(x).to.equal(5);
    });

    it("preserves the 'this' context of the call", function (done) {
        var foo = { bar: async(function () {
                return this;
            }) }, baz = { x: 7 };
        foo.bar().then(function (result) {
            return expect(result).to.equal(foo);
        }).then(function () {
            return foo.bar.call(baz);
        }).then(function (result) {
            return expect(result).to.equal(baz);
        }).then(function () {
            return done();
        }).catch(done);
    });

    it('eventually resolves with its definition\'s returned value', function (done) {
        var foo = async(function () {
            return 'blah';
        });
        foo().then(function (result) {
            return expect(result).to.equal('blah');
        }).then(function () {
            return done();
        }).catch(done);
    });

    it('eventually rejects with its definition\'s thrown value', function (done) {
        var act, exp = new Error('Expected thrown value to match rejection value');
        var foo = async(function () {
            throw exp;
            return 'blah';
        });
        foo().catch(function (err) {
            return act = err;
        }).then(function () {
            if (!act)
                done(new Error("Expected function to throw"));
            else if (act !== exp)
                done(exp);
            else
                done();
        });
    });

    it('emits progress with each yielded value', function (done) {
        var foo = async(function () {
            yield_(111);
            yield_(222);
            yield_(333);
            return 444;
        });
        var yields = [];
        foo().progressed(function (value) {
            return yields.push(value);
        }).then(function (result) {
            return expect(result).to.equal(444);
        }).then(function () {
            return expect(yields).to.deep.equal([111, 222, 333]);
        }).then(function () {
            return done();
        }).catch(done);
    });
});
//# sourceMappingURL=async.js.map
