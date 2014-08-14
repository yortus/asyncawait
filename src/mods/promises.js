var async = require('../async/index');
var await = require('../await/index');
var asyncMod = require('./async.promise');
var awaitMod = require('./await.promise');

/** TODO */
exports.mod = {
    name: 'promises',
    override: function (base, options) {
        return ({
            startup: function () {
                base.startup();
                async.promise = async.mod(asyncMod);
                await.promise = await.mod(awaitMod);
            },
            shutdown: function () {
                async.promise = null;
                await.promise = null;
                base.shutdown();
            }
        });
    },
    defaults: {}
};
//# sourceMappingURL=promises.js.map
