var oldBuilder = require('../src/awaitBuilder');
var pipeline = require('../src/pipeline');
var _ = require('../src/util');

//TODO: but overrideHandler call needs (REALLY??? check) to happen *after* user has a chance to set options
//      with config(...). So, builders must call the override...() func lazily ie when first
//      async(...) or await(...) call is made.
var newBuilder = oldBuilder.mod({
    name: 'promise',
    type: null,
    overrideHandlers: function (base, options) {
        return ({
            singular: function (co, arg) {
                if (!_.isPromise(arg))
                    return pipeline.notHandled;
                arg.then(function (val) {
                    return co.resume(null, val);
                }, co.resume);
            },
            variadic: function (co, args) {
                if (!_.isPromise(args[0]))
                    return pipeline.notHandled;
                args[0].then(function (val) {
                    return co.resume(null, val);
                }, co.resume);
            },
            elements: function (values, result) {
                // TODO: temp testing...
                var k = 0;
                values.forEach(function (value, i) {
                    if (_.isPromise(value)) {
                        value.then(function (val) {
                            return result(null, val, i);
                        }, function (err) {
                            return result(err, null, i);
                        });
                        ++k;
                    }
                });
                return k;
            }
        });
    }
});
module.exports = newBuilder;
//# sourceMappingURL=promise.js.map
