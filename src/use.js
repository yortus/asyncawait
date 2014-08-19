var async = require('./async');

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
module.exports = use;
//# sourceMappingURL=use.js.map
