var oldBuilder = require('../src/asyncBuilder');
var assert = require('assert');
var _ = require('../src/util');


var builder = oldBuilder.mod(function () {
    return ({
        invoke: function (co, callback) {
            assert(_.isFunction(callback), 'Expected final argument to be a callback');
            co.callback = callback;
            co.enter();
        },
        return: function (co, result) {
            return co.callback(null, result);
        },
        throw: function (co, error) {
            return co.callback(error);
        },
        finally: function (co) {
            co.callback = null;
        }
    });
});
module.exports = builder;
//# sourceMappingURL=cps.js.map
