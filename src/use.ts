import references = require('references');
import async = require('./async');
import await = require('./await');
export = use;



function use(mod: any) {

    // TODO: validate mod...

    // TODO: Handle mod...
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
