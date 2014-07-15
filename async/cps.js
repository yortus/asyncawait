var oldBuilder = require('../src/asyncBuilder');
var assert = require('assert');
var _ = require('../src/util');

var builder = oldBuilder.derive(function () {
    return ({
        invoke: function (co, callback) {
            assert(_.isFunction(callback), 'Expected final argument to be a callback');
            co.context = callback;
            co.enter();
        },
        return: function (callback, result) {
            return callback(null, result);
        },
        throw: function (callback, error) {
            return callback(error);
        }
    });
});
module.exports = builder;
//# sourceMappingURL=cps.js.map
