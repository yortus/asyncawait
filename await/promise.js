var oldBuilder = require('../src/awaitBuilder');
var pipeline = require('../src/pipeline');
var _ = require('../src/util');

//TODO: but overrideHandler call needs (REALLY??? check) to happen *after* user has a chance to set options
//      with config(...). So, builders must call the override...() func lazily ie when first
//      async(...) or await(...) call is made.
var newBuilder = oldBuilder.mod({
    name: 'promise',
    type: null,
    overrideHandler: function (base, options) {
        return function promiseHandler(co, arg, allArgs) {
            if (allArgs || !_.isPromise(arg))
                return pipeline.notHandled;
            arg.then(function (val) {
                return co.enter(null, val);
            }, co.enter);
        };
    }
});
module.exports = newBuilder;
//# sourceMappingURL=promise.js.map
