import references = require('references');
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import pipeline = require('asyncawait/src/pipeline');
import extensibility = require('asyncawait/src/extensibility');
var expect = chai.expect;


beforeEach(() => { extensibility.resetMods(); });


describe('The cpsKeyword mod', () => {

    function createFoo() {
        return async (() => {
            await (Promise.delay(20));
            return pipeline.currentFiber().id;
        });
    }

    it('defines the requested symbol globally', async.cps(() => {
        async.config({cpsKeyword: '__'});
        expect(global.__).to.not.exist;
        var foo = createFoo();
        expect(global.__).to.exist;
    }));

    it('fails if the requested symbol is already defined', async.cps(() => {
        async.config({cpsKeyword: 'console'});
        expect(() => createFoo()).to.throw();
    }));

    it('does not define the symbol if inactivated', async.cps(() => {
        async.config({cpsKeyword: null});
        expect(global.__).to.not.exist;
        var foo = createFoo();
        expect(global.__).to.not.exist;
    }));
});
