import _refs = require('_refs');
import NodebackCoro = require('./nodeback');
export = ThunkCoro;


class ThunkCoro extends NodebackCoro {
    constructor() { super(); }

    invoke(func: Function, this_: any, args: any[]) {
        return (callback?: (err, result) => void) => {
            args.push(callback || nullFunc);
            super.invoke(func, this_, args);
        };
    }

    static arityFor(func: Function) {
        return func.length;
    }
}


function nullFunc() {}
