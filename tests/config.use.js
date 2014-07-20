//TODO: restore...
//import references = require('references');
//import chai = require('chai');
//import Promise = require('bluebird');
//import async = require('asyncawait/async');
//import await = require('asyncawait/await');
//import use = require('asyncawait/src/use');
//import pipeline = require('asyncawait/src/pipeline');
//var expect = chai.expect;
////TODO: needed?
////beforeEach(() => origConcurrency = async.config().maxConcurrency);
////afterEach(() => async.config({ maxConcurrency: origConcurrency }));
////TODO: define test mods...
//var tracking = [];
//var testMod1 = (pipeline) => {
//    tracking.push('A');
//    return {
//        acquireCoro: protocol => {
//            //TODO: delegate...
//            pipeline.acquireCoro.apply(null, arguments);
//        }
//    };
//};
//var testMod2 = (pipeline) => {
//    tracking.push('B');
//    return {};
//};
//describe('Calling use(...)', () => {
//    it('does not execute the mod function if async(...) is never called', () => {
//        //TODO: test code here...
//    });
//    it('executes mod functions on the first call to async(...)', () => {
//        //TODO: test code here...
//    });
//    it('executes mod functions only once', () => {
//        //TODO: test code here...
//    });
//    it('executes mod functions in reverse order of their application', () => {
//        //TODO: test code here...
//    });
//    it('applies the mods to all async calls', () => {
//        //TODO: test code here...
//    });
//    it('fails if async(...) has already been called', () => {
//        //TODO: test code here...
//    });
//});
//# sourceMappingURL=config.use.js.map
