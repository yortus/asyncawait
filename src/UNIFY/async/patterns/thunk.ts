import _refs = require('_refs');
import NodebackIdiom = require('./nodeback');
export = ThunkIdiom;


class ThunkIdiom extends NodebackIdiom {
    constructor() { super(); }

    invoke(func: Function, this_: any, args: any[]) {
        return (callback: (err, result) => void) => {
            args.push(callback);
            super.invoke(func, this_, args);
        };
    }

    static arityFor(func: Function) {
        return func.length;
    }
}
