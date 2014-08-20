import references = require('references');
import async = require('./async');
import await = require('./await');
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
            break;
        default:
            throw new Error('');//TODO:...
    }
}
