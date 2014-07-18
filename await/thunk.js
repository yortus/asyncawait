var oldBuilder = require('../src/awaitBuilder');
var pipeline = require('../src/pipeline');
var _ = require('../src/util');

var builder = oldBuilder.derive(function () {
    return function thunkHandler(co, arg, allArgs) {
        if (allArgs || !_.isFunction(arg))
            return pipeline.notHandled;
        arg(co.enter);
    };
});
module.exports = builder;
//# sourceMappingURL=thunk.js.map
