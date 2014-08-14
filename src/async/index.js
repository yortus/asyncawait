var assert = require('assert');
var asyncBuilder = require('../asyncBuilder');
var iterable = require('./iterable/index');
var config = require('../config/index');
var _ = require('../util');

var api = function (invokee) {
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
api.iterable = iterable;

//TODO: temp
api.mods = [];
api.use = function (mod, expose) {
    if (typeof expose === "undefined") { expose = true; }
    assert(mod && _.isFunction(mod.override), 'use: expected mod to have an override function');
    assert(mod.name && _.isString(mod.name), 'use: expected mod to have a name');
    assert(!api.mods.hasOwnProperty(mod.name), "use: duplicate registration of mod name '" + mod.name + "'");

    api.mods[mod.name] = mod;

    if (expose) {
        var base = api;

        //TODO: temp testing... actually just get it directly from api.mods
        if (mod['base']) {
            var nameParts = mod['base'].split('.');
            while (nameParts.length > 0) {
                var namePart = nameParts.shift();

                //TODO: ensure namePart is a valid JS identifier and *is* an own property of host
                base = base[namePart];
            }
        }
        var modded = base.mod(mod);
        var nameParts = mod.name.split('.');
        var host = api;
        while (true) {
            var namePart = nameParts.shift();

            //TODO: ensure namePart is a valid JS identifier and is not (yet) an own property of host
            if (nameParts.length === 0) {
                host[namePart] = modded;
                break;
            }
            host = host[namePart] = {};
        }
    }
};
module.exports = api;
//# sourceMappingURL=index.js.map
