var async = require('../async/index');
var asyncMod = require('./async.express');

/** TODO */
//TODO: how to indicate that this must mod async.cps??
exports.mod = {
    name: 'express',
    //TODO: add checking in extensibility.ts or somehow for this:
    requires: ['cps'],
    override: function (base, options) {
        return ({
            startup: function () {
                base.startup();
                async.express = async.cps.mod(asyncMod);
            },
            shutdown: function () {
                async.express = null;
                base.shutdown();
            }
        });
    },
    defaults: {}
};
//# sourceMappingURL=express.js.map
