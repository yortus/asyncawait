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

describe('Calling use(...)', function () {
    it('does not execute the mod function if async(...) is never called', function () {
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
//# sourceMappingURL=use.js.map
