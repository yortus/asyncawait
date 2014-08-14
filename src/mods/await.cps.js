var _ = require('../util');

//TODO:...
var mod = {
    name: 'cps',
    type: null,
    override: function (base, options) {
        return ({
            singular: function (fi, arg) {
                if (arg !== void 0)
                    return _.notHandled;

                if (fi.awaiting.length !== 1) {
                    // TODO: mismatch here - raise an error
                    fi.resume(null, new Error('222'));
                }

                fi.awaiting[0] = function (err, res) {
                    fi.awaiting = [];
                    fi.resume(err, res);
                };
            },
            variadic: function (fi, args) {
                if (args[0] !== void 0)
                    return _.notHandled;
            },
            elements: function (values, result) {
                // TODO: temp testing...
                var k = 0, fi = _.currentFiber();
                values.forEach(function (value, i) {
                    if (i in values && values[i] === void 0) {
                        fi.awaiting[k++] = function (err, res) {
                            if (err)
                                return result(err, null, i);
                            return result(null, res, i);
                        };
                    }
                });
                if (k !== fi.awaiting.length) {
                    // TODO: mismatch here - raise an error
                    result(new Error('111'));
                }
                return k;
            }
        });
    }
};
module.exports = mod;
//# sourceMappingURL=await.cps.js.map
