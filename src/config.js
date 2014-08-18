var _ = require('./util');
var Protocol = require('./protocol');
var opts = require('./options');

var async = require('./async');
var jointProtocol = require('./jointProtocol');

// TODO:...
function options(value) {
    //TODO: as getter...
    if (arguments.length === 0)
        return opts.get();

    //TODO: as setter...
    opts.set(value);
    // 1. merge
    // 2. reload all joint/async/await mods
}
exports.options = options;

// TODO:...
function use(mod) {
    switch (mod.base.split('.')[0]) {
        case 'async':
            async.createVariant(mod);
            break;
        case 'await':
            break;
        case 'fiber':
            break;
        default:
            throw new Error('');
    }
}
exports.use = use;

// TODO:...
function restoreDefaults() {
}
exports.restoreDefaults = restoreDefaults;

//TODO: ============================================================================================= FIBER
var baseFiberMod = require('./mods/baseline').mod;
var _fiberProtocol = new Protocol(opts.get(), function () {
    return ({});
}).mod(baseFiberMod);
_.mergeProps(jointProtocol, _fiberProtocol.members); //TODO:...
//# sourceMappingURL=config.js.map
