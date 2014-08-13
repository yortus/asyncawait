import references = require('references');
import async = require('../async/index');
import await = require('../await/index');
import asyncMod = require('./async/thunk');
import awaitMod = require('./await/thunk');
import JointMod = AsyncAwait.JointMod;


/** TODO */
//TODO: how to indicate that this must mod async.cps??
export var mod: JointMod = {

    name: 'thunks',

    //TODO: add checking in extensibility.ts or somehow for this:
    requires: ['cps'],

    override: (base, options) => ({
    
        startup: () => {
            base.startup();
            async.thunk = async.cps.mod(asyncMod);
            await.thunk = await.mod(awaitMod);
        },

        shutdown: () => {
            async.thunk = null;
            await.thunk = null;
            base.shutdown();
        }
    }),

    defaults: { }
};
