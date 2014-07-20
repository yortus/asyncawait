var chai = require('chai');

var expect = chai.expect;

//TODO: needed?
//beforeEach(() => origConcurrency = async.config().maxConcurrency);
//afterEach(() => async.config({ maxConcurrency: origConcurrency }));
//TODO: define test mods...
var tracking = [];
var testMod1 = function (pipeline) {
    tracking.push('A');
    return {
        acquireCoro: function (protocol) {
            //TODO: delegate...
            pipeline.acquireCoro.apply(null, arguments);
        }
    };
};
var testMod2 = function (pipeline) {
    tracking.push('B');
    return {};
};

describe('Calling config.use(...)', function () {
    it('does not apply the mod if async(...) is never called', function () {
        //TODO: test code here...
    });

    it('executes mod functions on the first call to async(...)', function () {
        //TODO: test code here...
    });

    it('executes mod functions only once', function () {
        //TODO: test code here...
    });

    it('executes mod functions in reverse order of their application', function () {
        //TODO: test code here...
    });

    it('applies the mods to all async calls', function () {
        //TODO: test code here...
    });

    it('fails if async(...) has already been called', function () {
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
//# sourceMappingURL=config.use.js.map
