var async = require('../async/index');
var asyncMod = require('./async/stream');

/** TODO */
exports.mod = {
    name: 'streams',
    overrideProtocol: function (base, options) {
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
    defaultOptions: {}
};
//# sourceMappingURL=streams.js.map
