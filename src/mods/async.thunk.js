var _ = require('../util');

var mod = {
    name: 'async.thunk',
    base: 'async.cps',
    override: function (cps, options) {
        return ({
            begin: function (fi) {
                return function (callback) {
                    return cps.begin(fi, callback || _.empty);
                };
            }
        });
    }
};
module.exports = mod;
//# sourceMappingURL=async.thunk.js.map
