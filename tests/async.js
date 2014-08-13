var chai = require('chai');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

var yield_ = require('asyncawait/yield');
var _ = require('asyncawait/src/util');
var expect = chai.expect;

//TODO: tests for long stack traces across async calls?
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
            // TODO: review this... maybe even debug mode should attempt to get correct arity
            // Skip this test in DEBUG mode (see comments about DEBUG in src/asyncBuilder).
            if (_.DEBUG)
                return;

            var defns = [
                function (a, b, c) {
                },
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
        //TODO: was... remove
        //it('has an options property that matches the passed-in options', () => {
        //    var func2 = func.mod({ special: 777 });
        //    expect(func2.options).to.exist;
        //    expect(func2.options['special']).to.equal(777);
        //    var func2 = func.mod({ other: 'blah' });
        //    expect(func2.options['special']).to.not.exist;
        //    var func2 = func.mod({ override: () => { }, defaults: { special: 555 }});
        //    expect(func2.options).to.exist;
        //    expect(func2.options['special']).to.equal(555);
        //    expect(func2.options['blah']).to.not.exist;
        //});
        //TODO: was... remove
        //it('has a protocol property that matches the passed-in protocol', () => {
        //    var begin = (fi, arg) => 'blah';
        //    var func2 = func.mod({ override: () => ({ begin: begin })});
        //    expect(func2.protocol).to.exist;
        //    expect(func2.protocol.begin).to.equal(begin);
        //    var func3 = func.mod({ override: () => ({ a:1 })});
        //    expect(func3.protocol).to.exist;
        //    expect(func3.protocol.begin).to.not.equal(begin);
        //});
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

    it('begins executing synchronously and completes asynchronously', function (done) {
        var x = 5;
        var foo = async(function () {
            x = 7;
        });
        foo().then(function () {
            return expect(x).to.equal(9);
        }).then(function () {
            return done();
        }).catch(done);
        expect(x).to.equal(7);
        x = 9;
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

    it('works with await', function (done) {
        var foo = async(function () {
            return await(Promise.delay(20).then(function () {
                return 'blah';
            }));
        });
        foo().then(function (result) {
            return expect(result).to.equal('blah');
        }).then(function () {
            return done();
        }).catch(done);
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
