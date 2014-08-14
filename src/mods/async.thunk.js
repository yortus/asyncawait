var _ = require('../util');

//TODO: how to indicate that this must mod async.cps??
var mod = {
    name: 'thunk',
    //TODO: add checking in extensibility.ts or somehow for this:
    base: 'cps',
    type: null,
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
