var chai = require('chai');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var pipeline = require('asyncawait/src/pipeline');
var extensibility = require('asyncawait/src/extensibility');
var expect = chai.expect;

beforeEach(function () {
    extensibility.resetMods();
});

describe('The coroPool mod', function () {
    function createFoo() {
        return async(function () {
            await(Promise.delay(20));
            return pipeline.currentCoro().id;
        });
    }

    it('creates new coroutine instances on demand', async.cps(function () {
        async.config({ coroPool: true });
        var foo = createFoo();
        var ids = await([1, 2, 3, 4, 5].map(function () {
            return foo();
        }));
        var exp = ids.map(function (elem, index) {
            return ids[0] + index;
        });
        expect(ids).to.deep.equal(exp);
    }));

    it('reuses coroutine instances which have returned to the pool', async.cps(function () {
        async.config({ coroPool: true });
        var foo = createFoo();
        var ids = [1, 2, 3, 4, 5].map(function () {
            return await(foo());
        });
        var exp = ids.map(function () {
            return ids[0];
        });
        expect(ids).to.deep.equal(exp);
    }));

    it('does not reuse coroutine instances if inactivated', async.cps(function () {
        async.config({ coroPool: false });
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
//# sourceMappingURL=config.coroPool.js.map
