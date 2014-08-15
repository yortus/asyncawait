import references = require('references');
import assert = require('assert');
import asyncBuilder = require('./builder');
import config = require('../config');
import _ = require('../util');
export = api;


var api: AsyncAwait.Async.API = <any> function (invokee: Function) {
    assert(arguments.length === 1, 'async: expected a single argument');
    var async = config.options().defaults.async || asyncBuilder;
    return async(invokee);
};
api.mod = function mod(mod) {
    assert(arguments.length === 1, 'async.mod: expected a single argument');
    var async = config.options().defaults.async || asyncBuilder;
    return async.mod(mod);
};


//TODO: temp
api.mods = <any> [];
api.use = function(mod, expose = true) {

    assert(mod && _.isFunction(mod.override), 'use: expected mod to have an override function');
    assert(mod.name && _.isString(mod.name), 'use: expected mod to have a name');
    assert(!api.mods.hasOwnProperty(mod.name), "use: duplicate registration of mod name '" + mod.name + "'");

    api.mods[mod.name] = mod;

    if (expose) {
        var base = api;
        //TODO: temp testing... actually just get it directly from api.mods
        if (mod['base']) {
            var nameParts: string[] = mod['base'].split('.');
            while (nameParts.length > 0) {
                var namePart = nameParts.shift();
                //TODO: ensure namePart is a valid JS identifier and *is* an own property of host
                base = base[namePart];
            }
        }
        var modded = base.mod(mod);
        var nameParts = mod.name.split('.');
        var host: any = api;
        while (true) {
            var namePart = nameParts.shift();
            //TODO: ensure namePart is a valid JS identifier and is not (yet) an own property of host
            if (nameParts.length === 0) { host[namePart] = modded; break; }
            host = host[namePart] || (host[namePart] = {});
        }
    }
}
