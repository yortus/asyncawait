import references = require('references');
import _ = require('lodash');
import Protocol = require('./base');
export = CPSProtocol;


/** Protocol for a suspendable function which accepts a node-style callback. */
class CPSProtocol extends Protocol {
    constructor(options?: AsyncAwait.ProtocolOptions<AsyncAwait.AsyncCPS>) { super(); }

    invoke(callback_: AsyncAwait.Callback<any>) {
        //TODO: allow callback to be omitted if arity is known (need option for this?)
        if (!_.isFunction(callback_)) throw new Error('Expected final argument to be a callback');
        this.callback = callback_;
        super.invoke();//TODO: this is a no-op. Remove?
        setImmediate(() => super.resume());
    }

    return(result) {
        this.callback(null, result);
    }

    throw(error) {
        this.callback(error);
    }

    private callback: Function;
}
