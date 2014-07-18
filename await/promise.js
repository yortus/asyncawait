var oldBuilder = require('../src/awaitBuilder');
var pipeline = require('../src/pipeline');
var _ = require('../src/util');

var builder = oldBuilder.derive(function () {
    return function promiseHandler(co, arg, allArgs) {
        if (allArgs || !_.isPromise(arg))
            return pipeline.notHandled;
        arg.then(function (val) {
            return co.enter(null, val);
        }, co.enter);
    };
});
module.exports = builder;
//# sourceMappingURL=promise.js.map
