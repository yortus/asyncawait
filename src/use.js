var async = require('./async');
var await = require('./await');
var Protocol = require('./protocol');
var fiberProtocol = require('./fiberProtocol');
var options = require('./options');
var _ = require('./util');

function use(mod) {
    // TODO: validate mod...
    // Handle array of mods recursively
    if (_.isArray(mod))
        return mod.forEach(use);

    switch (mod.name.split('.')[0]) {
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
            throw new Error('');
    }
}

//TODO:... move somewhere
//TODO: ============================================================================================= FIBER
var baseFiberMod = require('./mods/baseline');
var _fiberProtocol = new Protocol(options(), function () {
    return ({});
}).mod(baseFiberMod);
_.mergeProps(fiberProtocol, _fiberProtocol.members); //TODO:...

//TODO:... move somewhere
function applyFiberMod(mod) {
    _fiberProtocol = _fiberProtocol.mod(mod);
    _.mergeProps(fiberProtocol, _fiberProtocol.members);
}
module.exports = use;
//# sourceMappingURL=use.js.map
