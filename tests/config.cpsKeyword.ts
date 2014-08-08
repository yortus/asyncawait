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

    function createFoo() {
        return async (() => {
            await (Promise.delay(20));
            return _.currentFiber().id;
        });
    }

    it('defines the requested symbol globally', async.cps(() => {
        config.options({cpsKeyword: '__'});
        expect(global.__).to.not.exist;
        var foo = createFoo();
        expect(global.__).to.exist;
    }));

    it('fails if the requested symbol is already defined', async.cps(() => {
        config.options({cpsKeyword: 'console'});
        expect(() => createFoo()).to.throw();
    }));

    it('does not define the symbol if inactivated', async.cps(() => {
        config.options({cpsKeyword: null});
        expect(global.__).to.not.exist;
        var foo = createFoo();
        expect(global.__).to.not.exist;
    }));
});
