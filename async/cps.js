var oldBuilder = require('../src/asyncBuilder');
var assert = require('assert');
var transfer = require('../src/transfer');

var builder = oldBuilder.mod({
    methods: function () {
        return ({
            invoke: function (co, callback) {
                assert(typeof (callback) === 'function', 'Expected final argument to be a callback');
                co.callback = callback;
                transfer(co);
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
    }
});
module.exports = builder;
//# sourceMappingURL=cps.js.map
