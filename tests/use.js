var chai = require('chai');

var expect = chai.expect;
//TODO: define test mods...
// var testMod1 = (pipeline) => {...}
// var testMod2 = (pipeline) => {...}
//TODO: add these use(...) tests...
// does not execute the mod function if async(...) is not called
// applies mods in X order
// executes the mod function on first call to async
// applies the mods to all async calls
// throws if use(...) called after async(...) call
// rejects invalid mods
//var origConcurrency;
//beforeEach(() => origConcurrency = async.config().maxConcurrency);
//afterEach(() => async.config({ maxConcurrency: origConcurrency }));
//describe('Getting a config object from async.config()', () => {
//    it('returns a different object on each call', () => {
//        var cfgs = [async.config(), async.config(), async.config()];
//        expect(cfgs[0]).to.not.equal(cfgs[1]);
//        expect(cfgs[0]).to.not.equal(cfgs[2]);
//        expect(cfgs[1]).to.not.equal(cfgs[2]);
//    });
//    it('returns an object that is a detached copy of config', () => {
//        var cfg = async.config();
//        cfg.maxConcurrency += 6;
//        expect(async.config().maxConcurrency).to.equal(cfg.maxConcurrency - 6);
//    });
//    it('returns the maxConcurrency value most recently set', () => {
//        async.config({ maxConcurrency: 17 });
//        expect(async.config().maxConcurrency).to.equal(17);
//        async.config({ maxConcurrency: 1000000 });
//        expect(async.config().maxConcurrency).to.equal(1000000);
//    });
//});
//# sourceMappingURL=use.js.map
