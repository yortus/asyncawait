//import references = require('references');
//import CPSProtocol = require('./cps');
//export = ThunkProtocol;


///** Protocol for a suspendable function which returns a thunk. */
//class ThunkProtocol extends CPSProtocol {
//    constructor(options?: AsyncAwait.ProtocolOptions<AsyncAwait.AsyncThunk>) { super(); }

//    invoke() {
//        return (callback?: (err, result) => void) => {
//            super.invoke(callback || nullFunc);
//        };
//    }
//}


//function nullFunc() {}
