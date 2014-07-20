import references = require('references');
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import extensibility = require('asyncawait/src/extensibility');
var expect = chai.expect;


//TODO: needed?
//beforeEach(() => origConcurrency = async.config().maxConcurrency);
//afterEach(() => async.config({ maxConcurrency: origConcurrency }));


//TODO: define test mods...
var tracking = [];
var testMod1 = (pipeline) => {
    tracking.push('A');
    return {
        acquireCoro: protocol => {

            //TODO: delegate...
            pipeline.acquireCoro.apply(null, arguments);    
        }    
    };
};
var testMod2 = (pipeline) => {
    tracking.push('B');
    return {};
};


describe('Calling config.use(...)', () => {

    it('does not apply the mod if async(...) is never called', () => {
        //TODO: test code here...
    });

    it('executes mod functions on the first call to async(...)', () => {
        //TODO: test code here...
    });

    it('executes mod functions only once', () => {
        //TODO: test code here...
    });

    it('executes mod functions in reverse order of their application', () => {
        //TODO: test code here...
    });

    it('applies the mods to all async calls', () => {
        //TODO: test code here...
    });

    it('fails if async(...) has already been called', () => {
        //TODO: test code here...
    });
});




    //TODO: no longer realistic? or generalise and move to config.use test suite
    //it('fails if applied more than once', done => {
    //    //TODO: was... reset();
    //    try {
    //        var i = 1;
    //        async.use(maxSlots));
    //        i = 2;
    //        async.use(maxSlots(5));
    //        i = 3;
    //    }
    //    catch (err) { }
    //    finally {
    //        expect(i).to.equal(2);
    //        done();
    //    }
    //});
