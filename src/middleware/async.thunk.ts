import references = require('references');
import _ = require('../util');
export = thunk;


function thunk(cps) {
    return {

        /** Synchronously returns a thunk function, whose invocation starts the suspendable function. */
        begin: (fi) => {
            return (callback: AsyncAwait.Callback<any>) => cps.begin(fi, callback || _.empty);
        }
    };
}
