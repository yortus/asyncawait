import references = require('references');
import chai = require('chai');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import extensibility = require('asyncawait/src/extensibility');
import Mod = AsyncAwait.Mod;
var expect = chai.expect;


// Define test mods
var tracking = [];
var testModA: Mod = {
    apply: (pipeline, options) => {
        tracking.push('apply A');
        return {
            acquireCoro: () => {
                tracking.push('acquire A');
                return pipeline.acquireCoro.apply(null, arguments);    
            },
            releaseCoro: () => {
                tracking.push('release A');
                pipeline.releaseCoro.apply(null, arguments);    
            }
        };
    },
    reset: () => tracking.push('reset A'),
    defaults: { a: 1 }
};
var testModB: Mod = {
    apply: (pipeline, options) => {
        tracking.push('apply B');
        return {
            acquireCoro: () => {
                tracking.push('acquire B');
                return pipeline.acquireCoro.apply(null, arguments);    
            },
            releaseCoro: () => {
                tracking.push('release B');
                pipeline.releaseCoro.apply(null, arguments);    
            }
        };
    },
    reset: () => tracking.push('reset B'),
    defaults: { b: 2 }
};


beforeEach(() => { extensibility.resetMods(); tracking = []; });


describe('The config.use(...) function', () => {

    it('registers the specified mod, without applying it', () => {
        expect(extensibility.externalMods).to.be.empty;
        async.config.use(testModA);
        expect(extensibility.externalMods).to.deep.equal([testModA]);
        async.config.use(testModB);
        expect(extensibility.externalMods).to.deep.equal([testModA, testModB]);
        expect(tracking).to.be.empty;
    });

    it('adds the mod\'s defaults to config', () => {
        expect(async.config()).to.not.have.key('a');
        async.config.use(testModA);
        expect(async.config()).to.haveOwnProperty('a');
        expect(async.config()['a']).to.equal(1);
    });

    it('rejects multiple registrations of the same mod', () => {
        async.config.use(testModA);
        expect(() => async.config.use(testModA)).to.throw();
        async.config.use(testModB);
        expect(() => async.config.use(testModB)).to.throw();
    });

    it('rejects registrations after async(...) is called', () => {
        async.config.use(testModA);
        var foo = async (()=>{});
        expect(() => async.config.use(testModB)).to.throw();
    });
});


describe('Registered mods', () => {

    it('are applied when async(...) is first called', () => {
        async.config.use(testModA);
        expect(tracking).to.be.empty;
        var foo = async (()=>{});
        expect(tracking).to.deep.equal(['apply A']);
    });

    it('are applied such that earliest registrations are outermost in pipeline call chains', () => {
        async.config.use(testModA);
        async.config.use(testModB);
        expect(tracking).to.be.empty;
        var foo = async (()=>{});
        expect(tracking).to.deep.equal(['apply B', 'apply A']);
    });

    it('have their pipeline overrides applied', async.cps(() => {
        async.config.use(testModA);
        expect(tracking).to.be.empty;
        var foo = async (()=>{});
        await (foo());
        expect(tracking).to.deep.equal(['apply A', 'acquire A', 'release A']);
    }));

    it('have their pipeline overrides called with correct nesting', async.cps(() => {
        async.config.use(testModA);
        async.config.use(testModB);
        expect(tracking).to.be.empty;
        var foo = async (()=>{});
        await (foo());
        expect(tracking).to.deep.equal(['apply B', 'apply A', 'acquire A', 'acquire B', 'release A', 'release B']);
    }));

    it('have their reset() functions called when resetMods() is called', async.cps(() => {
        async.config.use(testModA);
        async.config.use(testModB);
        var foo = async (()=>{});
        await (foo());
        tracking = [];
        extensibility.resetMods();
        expect(tracking).to.contain('reset A');
        expect(tracking).to.contain('reset B');
    }));
});
