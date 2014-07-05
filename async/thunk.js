var oldBuilder = require('./cps');
var _ = require('../src/util');

var newBuilder = oldBuilder.mod(function (options, cps) {
    return ({
        invoke: function (co) {
            return function (callback) {
                return cps.invoke(co, callback || _.empty);
            };
        }
    });
});
module.exports = newBuilder;
//# sourceMappingURL=thunk.js.map
