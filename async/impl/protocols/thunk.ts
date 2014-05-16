import references = require('references');
import CPSProtocol = require('./cps');
export = ThunkProtocol;


/** Protocol for a suspendable function which returns a thunk. */
class ThunkProtocol extends CPSProtocol {
    constructor(options?: AsyncAwait.ProtocolOptions<AsyncAwait.AsyncThunk>) { super(); }

    options(value?: AsyncAwait.ProtocolOptions<any>): AsyncAwait.ProtocolOptions<any> {
        return { constructor: <any> this.constructor, acceptsCallback: false };
    }

    invoke(func: Function, this_: any, args: any[]) {
        return (callback?: (err, result) => void) => {
            args.push(callback || nullFunc);
            super.invoke(func, this_, args);
        };
    }
}


function nullFunc() {}
