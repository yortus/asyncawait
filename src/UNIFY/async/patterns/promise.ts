import _refs = require('_refs');
import Promise = require('bluebird');
import Coro = require('../coro');
export = PromiseCoro;


class PromiseCoro extends Coro {
    constructor() { super(); }

    invoke(func: Function, this_: any, args: any[]) {
        this.resolver = Promise.defer<any>();
        super.invoke(func, this_, args);
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
