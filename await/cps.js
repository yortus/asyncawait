var oldBuilder = require('../src/awaitBuilder');
var pipeline = require('../src/pipeline');

var newBuilder = oldBuilder.mod({
    name: 'cps',
    type: null,
    overrideHandler: function (base, options) {
        return function cpsHandler(co, arg, allArgs) {
            if (allArgs || arg !== void 0)
                return pipeline.notHandled;
        };
    }
});

//TODO: is pipeline the right place for this?
newBuilder.continuation = pipeline.continuation;
module.exports = newBuilder;
//# sourceMappingURL=cps.js.map
