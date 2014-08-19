import references = require('references');
import async = require('./async');
export = use;



function use(mod: any) {

    // TODO: validate mod...

    // TODO: Handle mod...
    switch (mod.base.split('.')[0]) {//TODO: fix...
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
