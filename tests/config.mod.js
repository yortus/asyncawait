var chai = require('chai');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var extensibility = require('asyncawait/src/extensibility');

var expect = chai.expect;

// Define test mods
var tracking = [];
var testModA = {
    overrideProtocol: function (base, options) {
        return ({
            acquireFiber: function () {
                tracking.push('acquire A');
                return base.acquireFiber.apply(null, arguments);
            },
            releaseFiber: function () {
                tracking.push('release A');
                base.releaseFiber.apply(null, arguments);
            }
        });
    },
    apply: function () {
        return tracking.push('apply A');
    },
    reset: function () {
        return tracking.push('reset A');
    },
    defaultOptions: { a: 1 }
};
var testModB = {
    overrideProtocol: function (base, options) {
        return ({
            acquireFiber: function () {
                tracking.push('acquire B');
                return base.acquireFiber.apply(null, arguments);
            },
            releaseFiber: function () {
                tracking.push('release B');
                base.releaseFiber.apply(null, arguments);
            }
        });
    },
    apply: function () {
        return tracking.push('apply B');
    },
    reset: function () {
        return tracking.push('reset B');
    },
    defaultOptions: { b: 2 }
};

beforeEach(function () {
    extensibility.resetMods();
    tracking = [];
});

describe('The config.mod(...) function', function () {
    it('registers the specified mod, without applying it', function () {
        expect(extensibility.externalMods).to.be.empty;
        async.config.mod(testModA);
        expect(extensibility.externalMods).to.deep.equal([testModA]);
        async.config.mod(testModB);
        expect(extensibility.externalMods).to.deep.equal([testModA, testModB]);
        expect(tracking).to.be.empty;
    });

    it('adds the mod\'s defaults to config', function () {
        expect(async.config()).to.not.have.key('a');
        async.config.mod(testModA);
        expect(async.config()).to.haveOwnProperty('a');
        expect(async.config()['a']).to.equal(1);
    });

    it('rejects multiple registrations of the same mod', function () {
        async.config.mod(testModA);
        expect(function () {
            return async.config.mod(testModA);
        }).to.throw();
        async.config.mod(testModB);
        expect(function () {
            return async.config.mod(testModB);
        }).to.throw();
    });

    it('rejects registrations after async(...) is called', function () {
        async.config.mod(testModA);
        var foo = async(function () {
        });
        expect(function () {
            return async.config.mod(testModB);
        }).to.throw();
    });
});

describe('Registered mods', function () {
    it('are applied when async(...) is first called', function () {
        async.config.mod(testModA);
        expect(tracking).to.be.empty;
        var foo = async(function () {
        });
        expect(tracking).to.deep.equal(['apply A']);
    });

    it('are applied such that earliest registrations are outermost in joint protocol call chains', function () {
        async.config.mod(testModA);
        async.config.mod(testModB);
        expect(tracking).to.be.empty;
        var foo = async(function () {
        });
        expect(tracking).to.deep.equal(['apply B', 'apply A']);
    });

    it('have their joint protocol overrides applied', async.cps(function () {
        async.config.mod(testModA);
        expect(tracking).to.be.empty;
        var foo = async(function () {
        });
        await(foo());
        expect(tracking).to.deep.equal(['apply A', 'acquire A', 'release A']);
    }));

    it('have their joint protocol overrides called with correct nesting', async.cps(function () {
        async.config.mod(testModA);
        async.config.mod(testModB);
        expect(tracking).to.be.empty;
        var foo = async(function () {
        });
        await(foo());
        expect(tracking).to.deep.equal(['apply B', 'apply A', 'acquire A', 'acquire B', 'release A', 'release B']);
    }));

    it('have their reset() functions called when resetMods() is called', async.cps(function () {
        async.config.mod(testModA);
        async.config.mod(testModB);
        var foo = async(function () {
        });
        await(foo());
        tracking = [];
        extensibility.resetMods();
        expect(tracking).to.contain('reset A');
        expect(tracking).to.contain('reset B');
    }));
});
//# sourceMappingURL=config.mod.js.map
