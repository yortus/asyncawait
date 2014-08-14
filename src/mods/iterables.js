var async = require('../async/index');

var promiseMod = require('./async.iterable.promise');
var cpsMod = require('./async.iterable.cps');
var thunkMod = require('./async.iterable.thunk');
var _ = require('../util');

/** TODO */
exports.mod = {
    name: 'iterables',
    override: function (base, options) {
        return ({
            startup: function () {
                base.startup();

                //TODO: temp testing...
                var iterableMod = _.mergeProps({}, promiseMod);
                iterableMod.name = 'iterable';
                async.use(iterableMod);
                async.use(promiseMod);
                async.use(cpsMod);
                async.use(thunkMod);
            },
            shutdown: function () {
                delete async.mods['iterable']; //TODO: temp testing...
                delete async.mods['iterable.promise']; //TODO: temp testing...
                delete async.mods['iterable.cps']; //TODO: temp testing...
                delete async.mods['iterable.thunk']; //TODO: temp testing...
                async.iterable = null;
                base.shutdown();
            }
        });
    },
    defaults: {}
};
//# sourceMappingURL=iterables.js.map
