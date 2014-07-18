var oldBuilder = require('../src/awaitBuilder');
var pipeline = require('../src/pipeline');


var builder = oldBuilder.derive(function () {
    return function cpsHandler(co, arg, allArgs) {
        if (allArgs || arg !== void 0)
            return pipeline.notHandled;
    };
});

builder.continuation = function continuation() {
    var co = pipeline.currentCoro();
    return function continue_(err, result) {
        co.enter(err, result);
        co = null;
    };
};
module.exports = builder;
//# sourceMappingURL=cps.js.map
