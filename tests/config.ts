import references = require('references');
import chai = require('chai');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import config = require('asyncawait/config');
var expect = chai.expect;


beforeEach(() => { config.useDefaults(); });


describe('The config(...) function', () => {

    it('returns the current options when called with no arguments', () => {
        var opts = async.options();
        expect(opts).to.contain.keys('maxSlots', 'fiberPool');
    });

    it('Updates the current options with the key/value pairs passed in its first argument', () => {
        expect(config.options().maxSlots).to.be.null;
        expect(config.options()).to.not.contain.keys('abc');
        config.options({maxSlots: 10, abc: '123'});
        expect(config.options().maxSlots).to.equal(10);
        expect(config.options()['abc']).to.equal('123');
    });

    it('fails if called with an argument after the first async(...) call', () => {
        var opts = config.options();
        expect(opts).to.contain.keys('maxSlots', 'fiberPool');
        var foo = async (() => {});
        expect(() => config.options({maxSlots: 10})).to.throw();
    });
});
