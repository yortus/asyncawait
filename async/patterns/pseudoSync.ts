import references = require('references');
import PromiseIdiom = require('./promise');
import await = require('../../await/index');
export = PseudoSyncIdiom;


class PseudoSyncIdiom extends PromiseIdiom {
    constructor() { super(); }

    invoke(func: Function, this_: any, args: any[]) {
        return await (super.invoke(func, this_, args));
    }
}
