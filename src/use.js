var async = require('./async');
var await = require('./await');
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
            break;
        default:
            throw new Error('');
    }
}
module.exports = use;
//# sourceMappingURL=use.js.map
