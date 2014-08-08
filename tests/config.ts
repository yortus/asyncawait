import references = require('references');
import chai = require('chai');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import extensibility = require('asyncawait/src/extensibility');
import Mod = AsyncAwait.Mod;
var expect = chai.expect;


beforeEach(() => { extensibility.restoreDefaults(); });


describe('The config(...) function', () => {

    it('returns the current options when called with no arguments', () => {
        var opts = async.config();
        expect(opts).to.contain.keys('maxSlots', 'fiberPool');
    });

    it('Updates the current options with the key/value pairs passed in its first argument', () => {
        expect(async.config().maxSlots).to.be.null;
        expect(async.config()).to.not.contain.keys('abc');
        async.config({maxSlots: 10, abc: '123'});
        expect(async.config().maxSlots).to.equal(10);
        expect(async.config()['abc']).to.equal('123');
    });

    it('fails if called with an argument after the first async(...) call', () => {
        var opts = async.config();
        expect(opts).to.contain.keys('maxSlots', 'fiberPool');
        var foo = async (() => {});
        expect(() => async.config({maxSlots: 10})).to.throw();
    });
});
