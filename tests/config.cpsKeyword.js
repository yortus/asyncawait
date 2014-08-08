var chai = require('chai');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var config = require('asyncawait/config');
var _ = require('asyncawait/src/util');
var expect = chai.expect;

beforeEach(function () {
    config.useDefaults();
});

describe('The cpsKeyword mod', function () {
    function createFoo() {
        return async(function () {
            await(Promise.delay(20));
            return _.currentFiber().id;
        });
    }

    it('defines the requested symbol globally', async.cps(function () {
        config.options({ cpsKeyword: '__' });
        expect(global.__).to.not.exist;
        var foo = createFoo();
        expect(global.__).to.exist;
    }));

    it('fails if the requested symbol is already defined', async.cps(function () {
        config.options({ cpsKeyword: 'console' });
        expect(function () {
            return createFoo();
        }).to.throw();
    }));

    it('does not define the symbol if inactivated', async.cps(function () {
        config.options({ cpsKeyword: null });
        expect(global.__).to.not.exist;
        var foo = createFoo();
        expect(global.__).to.not.exist;
    }));
});
//# sourceMappingURL=config.cpsKeyword.js.map
