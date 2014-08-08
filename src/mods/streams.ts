import references = require('references');
import async = require('../async/index');
import asyncMod = require('./async/stream');
import Mod = AsyncAwait.Mod;


/** TODO */
export var mod: Mod = {

    name: 'streams',

    overrideProtocol: (base, options) => ({
    
        startup: () => {
            base.startup();
            async.stream = async.mod(asyncMod);
        },

        shutdown: () => {
            async.stream = null;
            base.shutdown();
        }
    }),

    defaultOptions: { }
};
