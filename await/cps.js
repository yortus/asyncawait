var oldBuilder = require('../src/awaitBuilder');
var jointProtocol = require('../src/jointProtocol');

var newBuilder = oldBuilder.mod({
    name: 'cps',
    type: null,
    overrideHandlers: function (base, options) {
        return ({
            singular: function (fi, arg) {
                if (arg !== void 0)
                    return jointProtocol.notHandled;

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
                    return jointProtocol.notHandled;
            },
            elements: function (values, result) {
                // TODO: temp testing...
                var k = 0, fi = jointProtocol.currentFiber();
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
});

//TODO: is jointProtocol the right place for this?
newBuilder.continuation = jointProtocol.continuation;
module.exports = newBuilder;
//# sourceMappingURL=cps.js.map
