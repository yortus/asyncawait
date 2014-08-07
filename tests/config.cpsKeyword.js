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

describe('The cpsKeyword mod', function () {
    function createFoo() {
        return async(function () {
            await(Promise.delay(20));
            return pipeline.currentFiber().id;
        });
    }

    it('defines the requested symbol globally', async.cps(function () {
        async.config({ cpsKeyword: '__' });
        expect(global.__).to.not.exist;
        var foo = createFoo();
        expect(global.__).to.exist;
    }));

    it('fails if the requested symbol is already defined', async.cps(function () {
        async.config({ cpsKeyword: 'console' });
        expect(function () {
            return createFoo();
        }).to.throw();
    }));

    it('does not define the symbol if inactivated', async.cps(function () {
        async.config({ cpsKeyword: null });
        expect(global.__).to.not.exist;
        var foo = createFoo();
        expect(global.__).to.not.exist;
    }));
});
//# sourceMappingURL=config.cpsKeyword.js.map
