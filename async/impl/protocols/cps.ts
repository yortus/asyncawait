import references = require('references');
import _ = require('lodash');
import Protocol = require('./base');
export = CPSProtocol;


/** Protocol for a suspendable function which accepts a node-style callback. */
class CPSProtocol extends Protocol {
    constructor(options?: AsyncAwait.ProtocolOptions<AsyncAwait.AsyncCPS>) { super(); }

    options(value?: AsyncAwait.ProtocolOptions<any>): AsyncAwait.ProtocolOptions<any> {
        return { constructor: <any> this.constructor, acceptsCallback: true };
    }

    invoke(func: Function, this_: any, args: any[]) {
        //TODO: allow callback to be omitted if arity is known (need option for this?)
        this.callback = args.pop();
        if (!_.isFunction(this.callback)) throw new Error('Expected final argument to be a callback');
        super.invoke(func, this_, args);
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
