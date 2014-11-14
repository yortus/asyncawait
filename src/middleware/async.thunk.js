var _ = require('../util');

function thunk(cps) {
    return {
        /** Synchronously returns a thunk function, whose invocation starts the suspendable function. */
        begin: function (fi) {
            return function (callback) {
                return cps.begin(fi, callback || _.empty);
            };
        }
    };
}
module.exports = thunk;
//# sourceMappingURL=async.thunk.js.map
