var chai = require('chai');
var async = require('asyncawait/async');

var extensibility = require('asyncawait/src/extensibility');

var expect = chai.expect;

beforeEach(function () {
    extensibility.resetMods();
});

describe('The config(...) function', function () {
    it('returns the current options when called with no arguments', function () {
        var opts = async.config();
        expect(opts).to.contain.keys('maxSlots', 'coroPool');
    });

    it('Updates the current options with the key/value pairs passed in its first argument', function () {
        expect(async.config().maxSlots).to.be.null;
        expect(async.config()).to.not.contain.keys('abc');
        async.config({ maxSlots: 10, abc: '123' });
        expect(async.config().maxSlots).to.equal(10);
        expect(async.config()['abc']).to.equal('123');
    });

    it('fails if called with an argument after the first async(...) call', function () {
        var opts = async.config();
        expect(opts).to.contain.keys('maxSlots', 'coroPool');
        var foo = async(function () {
        });
        expect(function () {
            return async.config({ maxSlots: 10 });
        }).to.throw();
    });
});
//# sourceMappingURL=config.js.map
