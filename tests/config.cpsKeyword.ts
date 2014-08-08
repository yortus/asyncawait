import references = require('references');
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import config = require('asyncawait/config');
import _ = require('asyncawait/src/util');
var expect = chai.expect;


beforeEach(() => { config.useDefaults(); });


describe('The cpsKeyword mod', () => {

    it('defines the requested symbol globally', async.cps(() => {
        expect(global.__).to.not.exist;
        config.options({cpsKeyword: '__'});
        expect(global.__).to.exist;
    }));

    it('fails if the requested symbol is already defined', async.cps(() => {
        expect(() => config.options({cpsKeyword: 'console'})).to.throw();
    }));

    it('does not define the symbol if inactivated', async.cps(() => {
        expect(global.__).to.not.exist;
        config.options({cpsKeyword: null});
        expect(global.__).to.not.exist;
    }));
});
