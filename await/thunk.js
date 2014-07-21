var oldBuilder = require('../src/awaitBuilder');
var pipeline = require('../src/pipeline');
var _ = require('../src/util');

var newBuilder = oldBuilder.mod({
    name: 'thunk',
    type: null,
    overrideHandler: function (base, options) {
        return function thunkHandler(co, arg, allArgs) {
            if (allArgs || !_.isFunction(arg))
                return pipeline.notHandled;
            arg(co.enter);
        };
    }
});
module.exports = newBuilder;
//# sourceMappingURL=thunk.js.map
