var oldBuilder = require('../src/awaitBuilder');
var pipeline = require('../src/pipeline');


var builder = oldBuilder.derive(function () {
    return function cpsHandler(co, args) {
        if (args.length !== 1 || args[0] !== void 0)
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
