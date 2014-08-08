var oldBuilder = require('./cps');
var _ = require('../util');

var newBuilder = oldBuilder.mod({
    name: 'thunk',
    type: null,
    overrideProtocol: function (cps, options) {
        return ({
            begin: function (fi) {
                return function (callback) {
                    return cps.begin(fi, callback || _.empty);
                };
            }
        });
    }
});
module.exports = newBuilder;
//# sourceMappingURL=thunk.js.map
