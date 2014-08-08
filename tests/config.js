var chai = require('chai');

var config = require('asyncawait/config');
var expect = chai.expect;

beforeEach(function () {
    config.useDefaults();
});

describe('The config(...) function', function () {
    it('returns the current options when called with no arguments', function () {
        var opts = config.options();
        expect(opts).to.contain.keys('maxSlots', 'fiberPool');
    });

    it('Updates the current options with the key/value pairs passed in its first argument', function () {
        expect(config.options().maxSlots).to.be.null;
        expect(config.options()).to.not.contain.keys('abc');
        config.options({ maxSlots: 10, abc: '123' });
        expect(config.options().maxSlots).to.equal(10);
        expect(config.options()['abc']).to.equal('123');
    });
    // TODO: was... restore/modify/fix all tests in here...
    //it('fails if called with an argument after the first async(...) call', () => {
    //    var opts = config.options();
    //    expect(opts).to.contain.keys('maxSlots', 'fiberPool');
    //    var foo = async (() => {});
    //    expect(() => config.options({maxSlots: 10})).to.throw();
    //});
});
//# sourceMappingURL=config.js.map
