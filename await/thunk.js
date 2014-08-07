var oldBuilder = require('../src/awaitBuilder');
var pipeline = require('../src/pipeline');
var _ = require('../src/util');

var newBuilder = oldBuilder.mod({
    name: 'thunk',
    type: null,
    overrideHandlers: function (base, options) {
        return ({
            singular: function (fi, arg) {
                if (!_.isFunction(arg))
                    return pipeline.notHandled;
                arg(fi.resume);
            },
            variadic: function (fi, args) {
                if (!_.isFunction(args[0]))
                    return pipeline.notHandled;
                args[0](fi.resume);
            },
            elements: function (values, result) {
                // TODO: temp testing...
                var k = 0;
                values.forEach(function (value, i) {
                    if (_.isFunction(value)) {
                        var callback = function (err, res) {
                            return result(err, res, i);
                        };
                        value(callback);
                        ++k;
                    }
                });
                return k;
            }
        });
    }
});
module.exports = newBuilder;
//# sourceMappingURL=thunk.js.map
