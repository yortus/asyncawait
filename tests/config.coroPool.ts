import references = require('references');
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import pipeline = require('asyncawait/src/pipeline');
import extensibility = require('asyncawait/src/extensibility');
var expect = chai.expect;


beforeEach(() => { extensibility.resetMods(); });


describe('The coroPool mod', () => {

    function createFoo() {
        return async (() => {
            await (Promise.delay(20));
            return (<CoroFiber> pipeline.currentCoro()).id;
        });
    }

    it('creates new coroutine instances on demand', async.cps(() => {
        async.config({coroPool: true});
        var foo = createFoo();
        var ids = await ([1,2,3,4,5].map(() => foo()));
        var exp = ids.map((elem, index) => ids[0] + index);
        expect(ids).to.deep.equal(exp);
    }));

    it('reuses coroutine instances which have returned to the pool', async.cps(() => {
        async.config({coroPool: true});
        var foo = createFoo();
        var ids = [1,2,3,4,5].map(() => await (foo()));
        var exp = ids.map(() => ids[0]);
        expect(ids).to.deep.equal(exp);
    }));

    it('does not reuse coroutine instances if inactivated', async.cps(() => {
        async.config({coroPool: false});
        var foo = createFoo();
        var ids = [1,2,3,4,5].map(() => await (foo()));
        var exp = ids.map((elem, index) => ids[0] + index);
        expect(ids).to.deep.equal(exp);
    }));
});
