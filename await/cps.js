var oldBuilder = require('../src/awaitBuilder');
var pipeline = require('../src/pipeline');

var newBuilder = oldBuilder.mod({
    name: 'cps',
    type: null,
    overrideHandlers: function (base, options) {
        return ({
            singular: function (co, arg) {
                if (arg !== void 0)
                    return pipeline.notHandled;
            },
            variadic: function (co, args) {
                if (args[0] !== void 0)
                    return pipeline.notHandled;
            }
        });
    }
});

//TODO: is pipeline the right place for this?
newBuilder.continuation = pipeline.continuation;
module.exports = newBuilder;
//# sourceMappingURL=cps.js.map
