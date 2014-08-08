var chai = require('chai');

var async = require('asyncawait/async');

var config = require('asyncawait/config');

var expect = chai.expect;

beforeEach(function () {
    config.useDefaults();
});

describe('The cpsKeyword mod', function () {
    it('defines the requested symbol globally', async.cps(function () {
        expect(global.__).to.not.exist;
        config.options({ cpsKeyword: '__' });
        expect(global.__).to.exist;
    }));

    it('fails if the requested symbol is already defined', async.cps(function () {
        expect(function () {
            return config.options({ cpsKeyword: 'console' });
        }).to.throw();
    }));

    it('does not define the symbol if inactivated', async.cps(function () {
        expect(global.__).to.not.exist;
        config.options({ cpsKeyword: null });
        expect(global.__).to.not.exist;
    }));
});
//# sourceMappingURL=config.cpsKeyword.js.map
