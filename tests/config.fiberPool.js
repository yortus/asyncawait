var chai = require('chai');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var extensibility = require('asyncawait/src/extensibility');
var _ = require('asyncawait/src/util');
var expect = chai.expect;

beforeEach(function () {
    extensibility.restoreDefaults();
});

describe('The fiberPool mod', function () {
    function createFoo() {
        return async(function () {
            await(Promise.delay(20));
            return _.currentFiber().id;
        });
    }

    it('creates new fiber instances on demand', async.cps(function () {
        async.config.mod({ fiberPool: true });
        var foo = createFoo();
        var ids = await([1, 2, 3, 4, 5].map(function () {
            return foo();
        }));
        var exp = ids.map(function (elem, index) {
            return ids[0] + index;
        });
        expect(ids).to.deep.equal(exp);
    }));

    it('reuses fiber instances which have returned to the pool', async.cps(function () {
        async.config.mod({ fiberPool: true });
        var foo = createFoo();
        var ids = [1, 2, 3, 4, 5].map(function () {
            return await(foo());
        });
        var exp = ids.map(function () {
            return ids[0];
        });
        expect(ids).to.deep.equal(exp);
    }));

    it('does not reuse fiber instances if inactivated', async.cps(function () {
        async.config.mod({ fiberPool: false });
        var foo = createFoo();
        var ids = [1, 2, 3, 4, 5].map(function () {
            return await(foo());
        });
        var exp = ids.map(function (elem, index) {
            return ids[0] + index;
        });
        expect(ids).to.deep.equal(exp);
    }));
});
//# sourceMappingURL=config.fiberPool.js.map
