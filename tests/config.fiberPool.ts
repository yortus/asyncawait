import references = require('references');
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import jointProtocol = require('asyncawait/src/jointProtocol');
import extensibility = require('asyncawait/src/extensibility');
var expect = chai.expect;


beforeEach(() => { extensibility.resetMods(); });


describe('The fiberPool mod', () => {

    function createFoo() {
        return async (() => {
            await (Promise.delay(20));
            return jointProtocol.currentFiber().id;
        });
    }

    it('creates new fiber instances on demand', async.cps(() => {
        async.config({fiberPool: true});
        var foo = createFoo();
        var ids = await ([1,2,3,4,5].map(() => foo()));
        var exp = ids.map((elem, index) => ids[0] + index);
        expect(ids).to.deep.equal(exp);
    }));

    it('reuses fiber instances which have returned to the pool', async.cps(() => {
        async.config({fiberPool: true});
        var foo = createFoo();
        var ids = [1,2,3,4,5].map(() => await (foo()));
        var exp = ids.map(() => ids[0]);
        expect(ids).to.deep.equal(exp);
    }));

    it('does not reuse fiber instances if inactivated', async.cps(() => {
        async.config({fiberPool: false});
        var foo = createFoo();
        var ids = [1,2,3,4,5].map(() => await (foo()));
        var exp = ids.map((elem, index) => ids[0] + index);
        expect(ids).to.deep.equal(exp);
    }));
});
