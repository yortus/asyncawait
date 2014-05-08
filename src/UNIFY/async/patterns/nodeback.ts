import _refs = require('_refs');
import Coro = require('../coro');
export = NodebackCoro;


class NodebackCoro extends Coro {
    constructor() { super(); }

    invoke(func: Function, this_: any, args: any[]) {
        this.callback = args.pop();
        super.invoke(func, this_, args).resume();
    }

    return(result) {
        this.callback(null, result);
    }

    throw(error) {
        this.callback(error);
    }

    private callback: Function;
}
