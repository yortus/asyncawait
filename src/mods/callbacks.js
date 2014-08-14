var async = require('../async/index');
var await = require('../await/index');
var asyncMod = require('./async.cps');
var awaitMod = require('./await.cps');
var _ = require('../util');

/** TODO */
exports.mod = {
    name: 'callbacks',
    override: function (base, options) {
        return ({
            startup: function () {
                base.startup();
                async.cps = async.mod(asyncMod);
                await.cps = await.mod(awaitMod);

                //TODO: right place for this?
                await.cps.continuation = _.createContinuation;
            },
            shutdown: function () {
                async.cps = null;
                await.cps = null;
                base.shutdown();
            }
        });
    },
    defaults: {}
};
//# sourceMappingURL=callbacks.js.map
