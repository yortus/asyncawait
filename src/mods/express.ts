import references = require('references');
import async = require('../async/index');
import asyncMod = require('./async/express');
import JointMod = AsyncAwait.JointMod;


/** TODO */
//TODO: how to indicate that this must mod async.cps??
export var mod: JointMod = {

    name: 'express',

    //TODO: add checking in extensibility.ts or somehow for this:
    requires: ['cps'],

    override: (base, options) => ({
    
        startup: () => {
            base.startup();
            async.express = async.cps.mod(asyncMod);
        },

        shutdown: () => {
            async.express = null;
            base.shutdown();
        }
    }),

    defaults: { }
};
