var Fiber = require('fibers');
var chai = require('chai');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var extensibility = require('asyncawait/src/extensibility');
var expect = chai.expect;

beforeEach(function () {
    extensibility.resetMods();
    peak = 0;
    Fiber.poolSize = 120;
});
var peak = 0;

describe('The fiberPoolFix mod', function () {
    function createFoo() {
        return async(function () {
            if (Fiber.poolSize > peak)
                peak = Fiber.poolSize;
            await(Promise.delay(20));
        });
    }

    it('adjusts Fiber.poolSize so it always exceeds the number of executing fibers', async.cps(function () {
        async.config({ fiberPoolFix: true });
        expect(Fiber.poolSize).to.equal(120);
        var foo = createFoo();
        await(Array.apply(0, new Array(200)).map(foo));
        expect(peak).to.be.gte(200);
    }));

    it('does not adjust Fiber.poolSize if inactivated', async.cps(function () {
        async.config({ fiberPoolFix: false });
        expect(Fiber.poolSize).to.equal(120);
        var foo = createFoo();
        await(Array.apply(0, new Array(200)).map(foo));
        expect(peak).to.equal(120);
    }));
});
//# sourceMappingURL=config.fiberPoolFix.js.map
