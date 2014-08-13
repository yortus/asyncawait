var async = require('../async/index');
var asyncMod = require('./async/stream');

/** TODO */
exports.mod = {
    name: 'streams',
    override: function (base, options) {
        return ({
            startup: function () {
                base.startup();
                async.stream = async.mod(asyncMod);
            },
            shutdown: function () {
                async.stream = null;
                base.shutdown();
            }
        });
    },
    defaults: {}
};
//# sourceMappingURL=streams.js.map
