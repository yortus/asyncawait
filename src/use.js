var async = require('./async');
var await = require('./await');

function use(mod) {
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
