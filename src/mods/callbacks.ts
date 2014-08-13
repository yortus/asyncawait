import references = require('references');
import async = require('../async/index');
import await = require('../await/index');
import asyncMod = require('./async/cps');
import awaitMod = require('./await/cps');
import _ = require('../util');
import JointMod = AsyncAwait.JointMod;


/** TODO */
export var mod: JointMod = {

    name: 'callbacks',

    override: (base, options) => ({
    
        startup: () => {
            base.startup();
            async.cps = async.mod(asyncMod);
            await.cps = await.mod(awaitMod);

            //TODO: right place for this?
            await.cps.continuation = _.createContinuation;

        },

        shutdown: () => {
            async.cps = null;
            await.cps = null;
            base.shutdown();
        }
    }),

    defaults: { }
};
