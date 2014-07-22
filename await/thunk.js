var oldBuilder = require('../src/awaitBuilder');
var pipeline = require('../src/pipeline');
var _ = require('../src/util');

var newBuilder = oldBuilder.mod({
    name: 'thunk',
    type: null,
    overrideHandlers: function (base, options) {
        return ({
            singular: function (co, arg) {
                if (!_.isFunction(arg))
                    return pipeline.notHandled;
                arg(co.enter);
            },
            variadic: function (co, args) {
                if (!_.isFunction(args[0]))
                    return pipeline.notHandled;
                args[0](co.enter);
            }
        });
    }
});
module.exports = newBuilder;
//# sourceMappingURL=thunk.js.map
