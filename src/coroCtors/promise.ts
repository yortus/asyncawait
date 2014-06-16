import references = require('references');
import Promise = require('bluebird');
import CoroutineBase = require('./base');
export = PromiseProtocol;


/** Protocol for a suspendable function which returns a promise. */
class PromiseCoroutine extends CoroutineBase {
    constructor(options?: AsyncAwait.ProtocolOptions<AsyncAwait.AsyncPromise>) { super(); }

    invoke() {
        this.resolver = Promise.defer<any>();
        super.invoke();//TODO: this is a no-op. Remove?
        setImmediate(() => super.resume());
        return this.resolver.promise;
    }

    return(result) {
        this.resolver.resolve(result);
    }

    throw(error) {
        this.resolver.reject(error);
    }

    yield(value) {
        this.resolver.progress(value);
    }

    private resolver: Promise.Resolver<any>;
}
