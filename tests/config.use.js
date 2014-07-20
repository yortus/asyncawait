var chai = require('chai');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var extensibility = require('asyncawait/src/extensibility');

var expect = chai.expect;

// Define test mods
var tracking = [];
var testModA = {
    apply: function (pipeline, options) {
        tracking.push('apply A');
        return {
            acquireCoro: function () {
                tracking.push('acquire A');
                return pipeline.acquireCoro.apply(null, arguments);
            },
            releaseCoro: function () {
                tracking.push('release A');
                pipeline.releaseCoro.apply(null, arguments);
            }
        };
    },
    reset: function () {
        return tracking.push('reset A');
    },
    defaults: { a: 1 }
};
var testModB = {
    apply: function (pipeline, options) {
        tracking.push('apply B');
        return {
            acquireCoro: function () {
                tracking.push('acquire B');
                return pipeline.acquireCoro.apply(null, arguments);
            },
            releaseCoro: function () {
                tracking.push('release B');
                pipeline.releaseCoro.apply(null, arguments);
            }
        };
    },
    reset: function () {
        return tracking.push('reset B');
    },
    defaults: { b: 2 }
};

beforeEach(function () {
    extensibility.resetMods();
    tracking = [];
});

describe('The config.use(...) function', function () {
    it('registers the specified mod, without applying it', function () {
        expect(extensibility.externalMods).to.be.empty;
        async.config.use(testModA);
        expect(extensibility.externalMods).to.deep.equal([testModA]);
        async.config.use(testModB);
        expect(extensibility.externalMods).to.deep.equal([testModA, testModB]);
        expect(tracking).to.be.empty;
    });

    it('adds the mod\'s defaults to config', function () {
        expect(async.config()).to.not.have.key('a');
        async.config.use(testModA);
        expect(async.config()).to.haveOwnProperty('a');
        expect(async.config()['a']).to.equal(1);
    });

    it('rejects multiple registrations of the same mod', function () {
        async.config.use(testModA);
        expect(function () {
            return async.config.use(testModA);
        }).to.throw();
        async.config.use(testModB);
        expect(function () {
            return async.config.use(testModB);
        }).to.throw();
    });

    it('rejects registrations after async(...) is called', function () {
        async.config.use(testModA);
        var foo = async(function () {
        });
        expect(function () {
            return async.config.use(testModB);
        }).to.throw();
    });
});

describe('Registered mods', function () {
    it('are applied when async(...) is first called', function () {
        async.config.use(testModA);
        expect(tracking).to.be.empty;
        var foo = async(function () {
        });
        expect(tracking).to.deep.equal(['apply A']);
    });

    it('are applied such that earliest registrations are outermost in pipeline call chains', function () {
        async.config.use(testModA);
        async.config.use(testModB);
        expect(tracking).to.be.empty;
        var foo = async(function () {
        });
        expect(tracking).to.deep.equal(['apply B', 'apply A']);
    });

    it('have their pipeline overrides applied', async.cps(function () {
        async.config.use(testModA);
        expect(tracking).to.be.empty;
        var foo = async(function () {
        });
        await(foo());
        expect(tracking).to.deep.equal(['apply A', 'acquire A', 'release A']);
    }));

    it('have their pipeline overrides called with correct nesting', async.cps(function () {
        async.config.use(testModA);
        async.config.use(testModB);
        expect(tracking).to.be.empty;
        var foo = async(function () {
        });
        await(foo());
        expect(tracking).to.deep.equal(['apply B', 'apply A', 'acquire A', 'acquire B', 'release A', 'release B']);
    }));

    it('have their reset() functions called when resetMods() is called', async.cps(function () {
        async.config.use(testModA);
        async.config.use(testModB);
        var foo = async(function () {
        });
        await(foo());
        tracking = [];
        extensibility.resetMods();
        expect(tracking).to.contain('reset A');
        expect(tracking).to.contain('reset B');
    }));
});
//# sourceMappingURL=config.use.js.map
