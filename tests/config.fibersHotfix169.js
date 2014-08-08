var Fiber = require('fibers');
var chai = require('chai');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var config = require('asyncawait/config');
var expect = chai.expect;

beforeEach(function () {
    config.useDefaults();
    peak = 0;
    Fiber.poolSize = 120;
});
var peak = 0;

describe('The fibersHotfix169 mod', function () {
    function createFoo() {
        return async(function () {
            if (Fiber.poolSize > peak)
                peak = Fiber.poolSize;
            await(Promise.delay(20));
        });
    }

    it('adjusts Fiber.poolSize so it always exceeds the number of executing fibers', async.cps(function () {
        config.options({ fibersHotfix169: true });
        expect(Fiber.poolSize).to.equal(120);
        var foo = createFoo();
        await(Array.apply(0, new Array(200)).map(foo));
        expect(peak).to.be.gte(200);
    }));

    it('does not adjust Fiber.poolSize if inactivated', async.cps(function () {
        config.options({ fibersHotfix169: false });
        expect(Fiber.poolSize).to.equal(120);
        var foo = createFoo();
        await(Array.apply(0, new Array(200)).map(foo));
        expect(peak).to.equal(120);
    }));
});
//# sourceMappingURL=config.fibersHotfix169.js.map
