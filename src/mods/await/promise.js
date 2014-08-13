var _ = require('../../util');

//TODO: but overrideHandler call needs (REALLY??? check) to happen *after* user has a chance to set options
//      with config(...). So, builders must call the override...() func lazily ie when first
//      async(...) or await(...) call is made.
var mod = {
    name: 'promise',
    type: null,
    override: function (base, options) {
        return ({
            singular: function (fi, arg) {
                if (!_.isPromise(arg))
                    return _.notHandled;
                arg.then(function (val) {
                    return fi.resume(null, val);
                }, fi.resume);
            },
            variadic: function (fi, args) {
                if (!_.isPromise(args[0]))
                    return _.notHandled;
                args[0].then(function (val) {
                    return fi.resume(null, val);
                }, fi.resume);
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
};
module.exports = mod;
//# sourceMappingURL=promise.js.map
