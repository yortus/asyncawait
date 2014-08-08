var async = require('../async/index');
var await = require('../await/index');
var asyncMod = require('./async/thunk');
var awaitMod = require('./await/thunk');

/** TODO */
//TODO: how to indicate that this must mod async.cps??
exports.mod = {
    name: 'thunks',
    //TODO: add checking in extensibility.ts or somehow for this:
    requires: ['cps'],
    overrideProtocol: function (base, options) {
        return ({
            startup: function () {
                base.startup();
                async.thunk = async.cps.mod(asyncMod);
                await.thunk = await.mod(awaitMod);
            },
            shutdown: function () {
                async.thunk = null;
                await.thunk = null;
                base.shutdown();
            }
        });
    },
    defaultOptions: {}
};
//# sourceMappingURL=thunks.js.map
