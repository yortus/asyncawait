import references = require('references');
import async = require('../async/index');
import await = require('../await/index');
import promiseMod = require('./async.iterable.promise');
import cpsMod = require('./async.iterable.cps');
import thunkMod = require('./async.iterable.thunk');
import _ = require('../util');
import JointMod = AsyncAwait.JointMod;


/** TODO */
export var mod: JointMod = {

    name: 'iterables',

    override: (base, options) => ({
    
        startup: () => {
            base.startup();

            //TODO: temp testing...
            var iterableMod = _.mergeProps({}, promiseMod);
            iterableMod.name = 'iterable';
            async.use(iterableMod);
            async.use(promiseMod);
            async.use(cpsMod);
            async.use(thunkMod);
        },

        shutdown: () => {
            delete async.mods['iterable']; //TODO: temp testing...
            delete async.mods['iterable.promise']; //TODO: temp testing...
            delete async.mods['iterable.cps']; //TODO: temp testing...
            delete async.mods['iterable.thunk']; //TODO: temp testing...
            async.iterable = null;
            base.shutdown();
        }
    }),

    defaults: { }
};
