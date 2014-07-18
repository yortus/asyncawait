var oldBuilder = require('../src/awaitBuilder');
var pipeline = require('../src/pipeline');
var _ = require('../src/util');


var builder = oldBuilder.derive(function () {
    return function promiseHandler(co, args) {
        if (args.length !== 1 || !_.isPromise(args[0]))
            return pipeline.notHandled;
        args[0].then(function (val) {
            return co.enter(null, val);
        }, co.enter);
    };
});
module.exports = builder;
//# sourceMappingURL=promise.js.map
