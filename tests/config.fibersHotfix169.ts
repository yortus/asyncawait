import references = require('references');
import Fiber = require('fibers');
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import extensibility = require('asyncawait/src/extensibility');
var expect = chai.expect;


beforeEach(() => { extensibility.resetMods(); peak = 0; Fiber.poolSize = 120; });
var peak = 0;


describe('The fibersHotfix169 mod', () => {

    function createFoo() {
        return async (() => {
            if (Fiber.poolSize > peak) peak = Fiber.poolSize;
            await (Promise.delay(20));
        });
    }

    it('adjusts Fiber.poolSize so it always exceeds the number of executing fibers', async.cps(() => {
        async.config({fibersHotfix169: true});
        expect(Fiber.poolSize).to.equal(120);
        var foo = createFoo();
        await (Array.apply(0, new Array(200)).map(foo));
        expect(peak).to.be.gte(200);
    }));

    it('does not adjust Fiber.poolSize if inactivated', async.cps(() => {
        async.config({fibersHotfix169: false});
        expect(Fiber.poolSize).to.equal(120);
        var foo = createFoo();
        await (Array.apply(0, new Array(200)).map(foo));
        expect(peak).to.equal(120);
    }));
});
