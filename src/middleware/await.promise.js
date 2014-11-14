var _ = require('../util');

function promise(options) {
    return {
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
    };
}
module.exports = promise;
//# sourceMappingURL=await.promise.js.map
