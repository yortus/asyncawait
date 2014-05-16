import references = require('references');
import CPSProtocol = require('./cps');
export = ThunkProtocol;


/** Protocol for a suspendable function which returns a thunk. */
class ThunkProtocol extends CPSProtocol {
    constructor() { super(); }

    invoke(func: Function, this_: any, args: any[]) {
        return (callback?: (err, result) => void) => {
            args.push(callback || nullFunc);
            super.invoke(func, this_, args);
        };
    }

    static SuspendableType: AsyncAwait.AsyncThunk;

    static arityFor(func: Function) {
        return func.length;
    }
}


function nullFunc() {}
