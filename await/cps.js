var oldBuilder = require('../src/awaitBuilder');
var pipeline = require('../src/pipeline');


var builder = oldBuilder.derive(function () {
    return function (co, args) {
        if (args.length !== 1 || args[0] !== void 0)
            return pipeline.notHandled;
    };
});

builder.continuation = function () {
    var co = pipeline.currentCoro();
    return function (err, result) {
        co.enter(err, result);
        co = null;
    };
};
module.exports = builder;
//# sourceMappingURL=cps.js.map
