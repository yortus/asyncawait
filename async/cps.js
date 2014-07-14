var oldBuilder = require('../src/asyncBuilder');
var assert = require('assert');
var _ = require('../src/util');

var builder = oldBuilder.derive(function () {
    return ({
        clear: function (co) {
            co.callback = null;
        },
        invoke: function (co, callback) {
            assert(_.isFunction(callback), 'Expected final argument to be a callback');
            co.callback = callback;
            co.enter();
        },
        return: function (ctx, result) {
            return ctx.callback(null, result);
        },
        throw: function (ctx, error) {
            return ctx.callback(error);
        }
    });
});
module.exports = builder;
//# sourceMappingURL=cps.js.map
