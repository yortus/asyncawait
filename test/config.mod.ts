import references = require('references');
import chai = require('chai');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import config = require('asyncawait/config');
import JointMod = AsyncAwait.JointMod;
var expect = chai.expect;


//TODO: need more tests for various scenarios...

// Define test mods
var tracking = [];
var testModA: JointMod = {
    override: (base, options) => ({
        acquireFiber: () => {
            tracking.push('acquire A');
            return base.acquireFiber.apply(null, arguments);
        },
        releaseFiber: () => {
            tracking.push('release A');
            base.releaseFiber.apply(null, arguments);    
        },
        startup: () => tracking.push('apply A'),
        shutdown: () => tracking.push('reset A')
    }),
    defaults: { a: 1 }
};
var testModB: JointMod = {
    override: (base, options) => ({
        acquireFiber: () => {
            tracking.push('acquire B');
            return base.acquireFiber.apply(null, arguments);    
        },
        releaseFiber: () => {
            tracking.push('release B');
            base.releaseFiber.apply(null, arguments);    
        },
        startup: () => tracking.push('apply B'),
        shutdown: () => tracking.push('reset B')
    }),
    defaults: { b: 2 }
};


beforeEach(() => { config.useDefaults(); tracking = []; });


describe('The config.mod(...) function', () => {

    // TODO: was...
    //it('registers the specified mod, without applying it', () => {
    //    expect(extensibility.externalMods).to.be.empty;
    //    async.config.mod(testModA);
    //    expect(extensibility.externalMods).to.deep.equal([testModA]);
    //    async.config.mod(testModB);
    //    expect(extensibility.externalMods).to.deep.equal([testModA, testModB]);
    //    expect(tracking).to.be.empty;
    //});

    it('adds the mod\'s defaults to config', () => {
        expect(config.options()).to.not.have.key('a');
        config.use(testModA);
        expect(config.options()).to.haveOwnProperty('a');
        expect(config.options()['a']).to.equal(1);
    });

    //TODO: restore this...
    //it('rejects multiple registrations of the same mod', () => {
    //    config.use(testModA);
    //    expect(() => config.use(testModA)).to.throw();
    //    config.use(testModB);
    //    expect(() => config.use(testModB)).to.throw();
    //});

    // TODO: was...
    //it('rejects registrations after async(...) is called', () => {
    //    async.config.mod(testModA);
    //    var foo = async (()=>{});
    //    expect(() => async.config.mod(testModB)).to.throw();
    //});
});


describe('Registered mods', () => {

    // TODO: was... restore/modify/fix all tests in here...
    //it('are applied when async(...) is first called', () => {
    //    async.config.mod(testModA);
    //    expect(tracking).to.be.empty;
    //    var foo = async (()=>{});
    //    expect(tracking).to.deep.equal(['apply A']);
    //});

    //it('are applied such that latest registrations are outermost in joint protocol call chains', () => {
    //    expect(tracking).to.be.empty;
    //    async.config.mod(testModA);
    //    async.config.mod(testModB);
    //    expect(tracking).to.deep.equal(['apply A', 'apply B']);
    //});

    //it('have their joint protocol overrides applied', async.cps(() => {
    //    expect(tracking).to.be.empty;
    //    async.config.mod(testModA);
    //    var foo = async (()=>{});
    //    await (foo());
    //    expect(tracking).to.deep.equal(['apply A', 'acquire A', 'release A']);
    //}));

    //it('have their joint protocol overrides called with correct nesting', async.cps(() => {
    //    expect(tracking).to.be.empty;
    //    async.config.mod(testModA);
    //    async.config.mod(testModB);
    //    var foo = async (()=>{});
    //    await (foo());
    //    expect(tracking).to.deep.equal(['apply A', 'apply B', 'acquire B', 'acquire A', 'release B', 'release A']);
    //}));

    ////TODO: in a specific order? eg opposite of apply?
    //it('have their reset() functions called when resetMods() is called', async.cps(() => {
    //    async.config.mod(testModA);
    //    async.config.mod(testModB);
    //    var foo = async (()=>{});
    //    await (foo());
    //    tracking = [];
    //    extensibility.resetAll();
    //    expect(tracking).to.contain('reset A');
    //    expect(tracking).to.contain('reset B');
    //}));
});
