var _ = require('../util');

///** TODO */
var mods = [
    {
        name: 'async.thunk',
        base: 'async.cps',
        override: overrideAsync
    },
    {
        name: 'await.thunk',
        base: 'await.cps',
        override: overrideAwait
    }
];

function overrideAsync(cps, options) {
    return {
        begin: function (fi) {
            return function (callback) {
                return cps.begin(fi, callback || _.empty);
            };
        }
    };
}

function overrideAwait(base, options) {
    return {
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
    };
}
module.exports = mods;
//# sourceMappingURL=thunks.js.map
