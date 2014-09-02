import references = require('references');
import async = require('./async');
import await = require('./await');
import Protocol = require('./protocol');
import fiberProtocol = require('./fiberProtocol');
import options = require('./options');
import _ = require('./util');
export = use;



function use(mod: any) {

    // TODO: validate mod...

    // Handle array of mods recursively
    if (_.isArray(mod)) return mod.forEach(use);


    // TODO: Handle single mod...
    switch (mod.name.split('.')[0]) {//TODO: fix...
        case 'async':
            async.createVariant(mod);
            break;
        case 'await':
            await.createVariant(mod);
            break;
        case 'fiber':
            applyFiberMod(mod);
            break;
        default:
            throw new Error('');//TODO:...
    }
}




//TODO:... move somewhere
//TODO: ============================================================================================= FIBER
var baseFiberMod = require('./mods/baseline');
var _fiberProtocol = new Protocol(options(), () => ({})).mod(baseFiberMod);
_.mergeProps(fiberProtocol, _fiberProtocol.members);//TODO:...


//TODO:... move somewhere
function applyFiberMod(mod: AsyncAwait.Mod<any>) {
    _fiberProtocol = _fiberProtocol.mod(mod);
    _.mergeProps(fiberProtocol, _fiberProtocol.members);
}
