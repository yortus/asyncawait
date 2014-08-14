var async = require('../async/index');
var await = require('../await/index');
var asyncMod = require('./async.thunk');
var awaitMod = require('./await.thunk');

/** TODO */
//TODO: how to indicate that this must mod async.cps??
exports.mod = {
    name: 'thunks',
    //TODO: add checking in extensibility.ts or somehow for this:
    requires: ['cps'],
    override: function (base, options) {
        return ({
            startup: function () {
                base.startup();
                async.use(asyncMod); //TODO: temp testing...

                //async.thunk = async.cps.mod(asyncMod);
                await.thunk = await.mod(awaitMod);
            },
            shutdown: function () {
                delete async.mods['thunk']; //TODO: temp testing...
                async.thunk = null;
                await.thunk = null;
                base.shutdown();
            }
        });
    },
    defaults: {}
};
//# sourceMappingURL=thunks.js.map
