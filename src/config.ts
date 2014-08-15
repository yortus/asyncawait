import references = require('references');
import assert = require('assert');
import _ = require('./util');
import Protocol = require('./protocol');
import opts = require('./options');
import createSuspendableFunction = require('./___OLD___async/createSuspendableFunction');//TODO:...
import async = require('./async');
import jointProtocol = require('./jointProtocol');//TODO:...
import ConfigAPI = AsyncAwait2.ConfigAPI;
import Mod = AsyncAwait2.Mod;


// TODO:...
export function options(value?: any): any {

    //TODO: as getter...
    if (arguments.length === 0) return opts.get();

    //TODO: as setter...
    opts.set(value);
    // 1. merge
    // 2. reload all joint/async/await mods
}


// TODO:...
export function use(mod: Mod): any {

    // TODO: validate mod...

    // TODO: Handle mod...
    switch (mod.type) {
        case 'async':
            async.createVariant(mod);
            break;
        case 'await':
            break;
        case 'fiber':
            break;
        default:
            throw new Error('');//TODO:...
    }
}


// TODO:...
export function restoreDefaults() {
    
}


//TODO: ============================================================================================= FIBER
var baseFiberMod = require('./mods/baseline').mod;
var _fiberProtocol = new Protocol(opts.get(), () => ({})).mod(baseFiberMod);
_.mergeProps(jointProtocol, _fiberProtocol.members);//TODO:...
