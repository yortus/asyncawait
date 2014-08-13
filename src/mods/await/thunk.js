var _ = require('../../util');

var mod = {
    name: 'thunk',
    type: null,
    override: function (base, options) {
        return ({
            singular: function (fi, arg) {
                if (!_.isFunction(arg))
                    return _.notHandled;
                arg(fi.resume);
            },
            variadic: function (fi, args) {
                if (!_.isFunction(args[0]))
                    return _.notHandled;
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
};
module.exports = mod;
//# sourceMappingURL=thunk.js.map
