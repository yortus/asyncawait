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
    overrideProtocol: (base, options) => ({
        acquireFiber: () => {
            tracking.push('acquire A');
            return base.acquireFiber.apply(null, arguments);    
        },
        releaseFiber: () => {
            tracking.push('release A');
            base.releaseFiber.apply(null, arguments);    
        }
    }),
    apply: () => tracking.push('apply A'),
    reset: () => tracking.push('reset A'),
    defaultOptions: { a: 1 }
};
var testModB: Mod = {
    overrideProtocol: (base, options) => ({
        acquireFiber: () => {
            tracking.push('acquire B');
            return base.acquireFiber.apply(null, arguments);    
        },
        releaseFiber: () => {
            tracking.push('release B');
            base.releaseFiber.apply(null, arguments);    
        }
    }),
    apply: () => tracking.push('apply B'),
    reset: () => tracking.push('reset B'),
    defaultOptions: { b: 2 }
};


beforeEach(() => { extensibility.resetMods(); tracking = []; });


describe('The config.mod(...) function', () => {

    it('registers the specified mod, without applying it', () => {
        expect(extensibility.externalMods).to.be.empty;
        async.config.mod(testModA);
        expect(extensibility.externalMods).to.deep.equal([testModA]);
        async.config.mod(testModB);
        expect(extensibility.externalMods).to.deep.equal([testModA, testModB]);
        expect(tracking).to.be.empty;
    });

    it('adds the mod\'s defaults to config', () => {
        expect(async.config()).to.not.have.key('a');
        async.config.mod(testModA);
        expect(async.config()).to.haveOwnProperty('a');
        expect(async.config()['a']).to.equal(1);
    });

    it('rejects multiple registrations of the same mod', () => {
        async.config.mod(testModA);
        expect(() => async.config.mod(testModA)).to.throw();
        async.config.mod(testModB);
        expect(() => async.config.mod(testModB)).to.throw();
    });

    it('rejects registrations after async(...) is called', () => {
        async.config.mod(testModA);
        var foo = async (()=>{});
        expect(() => async.config.mod(testModB)).to.throw();
    });
});


describe('Registered mods', () => {

    it('are applied when async(...) is first called', () => {
        async.config.mod(testModA);
        expect(tracking).to.be.empty;
        var foo = async (()=>{});
        expect(tracking).to.deep.equal(['apply A']);
    });

    it('are applied such that latest registrations are outermost in joint protocol call chains', () => {
        async.config.mod(testModA);
        async.config.mod(testModB);
        expect(tracking).to.be.empty;
        var foo = async (()=>{});
        expect(tracking).to.deep.equal(['apply A', 'apply B']);
    });

    it('have their joint protocol overrides applied', async.cps(() => {
        async.config.mod(testModA);
        expect(tracking).to.be.empty;
        var foo = async (()=>{});
        await (foo());
        expect(tracking).to.deep.equal(['apply A', 'acquire A', 'release A']);
    }));

    it('have their joint protocol overrides called with correct nesting', async.cps(() => {
        async.config.mod(testModA);
        async.config.mod(testModB);
        expect(tracking).to.be.empty;
        var foo = async (()=>{});
        await (foo());
        expect(tracking).to.deep.equal(['apply A', 'apply B', 'acquire B', 'acquire A', 'release B', 'release A']);
    }));

    //TODO: in a specific order? eg opposite of apply?
    it('have their reset() functions called when resetMods() is called', async.cps(() => {
        async.config.mod(testModA);
        async.config.mod(testModB);
        var foo = async (()=>{});
        await (foo());
        tracking = [];
        extensibility.resetMods();
        expect(tracking).to.contain('reset A');
        expect(tracking).to.contain('reset B');
    }));
});
