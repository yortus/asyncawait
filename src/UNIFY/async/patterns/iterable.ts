import _refs = require('_refs');
import _ = require('lodash');
import Promise = require('bluebird');
import Coro = require('../coro');
export = IterableCoro;


class IterableCoro extends Coro {
    constructor() { super(); }

    invoke(func: Function, this_: any, args: any[]) {
        super.invoke(func, this_, args);
        return <any> new AsyncIterator(this);
    }

    invokeNext(callback?) {
        var res = this.nextResolver = Promise.defer<any>();
        setImmediate(() => this.done ? res.reject('iterated past end') : this.resume());
        return this.nextResolver.promise;
    }

    return(result) {
        this.done = true;
        this.nextResolver.resolve({ done: true, value: result });
    }

    throw(error) {
        this.nextResolver.reject(error);
    }

    yield(value) {
        var result = { done: false, value: value };
        this.nextResolver.resolve(result);
        this.suspend();
    }

    private nextResolver: Promise.Resolver<any> = null;
    private done: boolean;
}


class AsyncIterator {

    constructor(private iterable: IterableCoro) { }

    next(callback?) {
        return this.iterable.invokeNext(callback);
    }

    forEach(callback: (value) => void) {

        // Ensure that a single argument has been supplied, which is a function.
        if (arguments.length !== 1) throw new Error('forEach(): expected a single argument');
        if (!_.isFunction(callback)) throw new Error('forEach(): expected argument to be a function');

        var result = Promise.defer<void>();
        var stepResolved = item => {
            if (item.done) return result.resolve(item.value);
            callback(item.value);
            setImmediate(() => this.next().then(stepResolved, err => result.reject(err)));
        }
        this.next().then(stepResolved, err => result.reject(err))
        return result.promise;
    }
}
