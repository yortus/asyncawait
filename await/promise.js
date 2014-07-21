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

//TODO: possible new style... could be similar for async builder and global mods
//TODO: call with await.make(mod), async.make(mod), config.use(mod)
//TODO: but overrideHandler call needs (REALLY??? check) to happen *after* user has a chance to set options
//      with config(...). So, builders must call the override...() func lazily ie when first
//      async(...) or await(...) call is made.
var builder2 = oldBuilder.derive({
    name: 'promise',
    type: null,
    overrideHandler: function (baseHandler, options) {
        return function promiseHandler(co, arg, allArgs) {
            if (allArgs || !_.isPromise(arg))
                return pipeline.notHandled;
            arg.then(function (val) {
                return co.enter(null, val);
            }, co.enter);
        };
    },
    defaultOptions: {}
});
module.exports = builder;
//# sourceMappingURL=promise.js.map
