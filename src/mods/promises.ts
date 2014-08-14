import references = require('references');
import async = require('../async/index');
import await = require('../await/index');
import asyncMod = require('./async.promise');
import awaitMod = require('./await.promise');
import JointMod = AsyncAwait.JointMod;


/** TODO */
export var mod: JointMod = {

    name: 'promises',

    override: (base, options) => ({
    
        startup: () => {
            base.startup();
            async.promise = async.mod(asyncMod);
            await.promise = await.mod(awaitMod);
        },

        shutdown: () => {
            async.promise = null;
            await.promise = null;
            base.shutdown();
        }
    }),

    defaults: { }
};
