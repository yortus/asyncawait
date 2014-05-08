import _refs = require('_refs');
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
        this.nextResolver = Promise.defer<any>();
        this.resume();
        return this.nextResolver.promise;
    }

    return(result) {
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
}


//TODO: catch more errors - eg re-iteration, next after done, etc
class AsyncIterator {

    constructor(private iterable: IterableCoro) { }

    next(callback?) {
        return this.iterable.invokeNext(callback);
    }

    forEach(callback: (value) => void) {
        var result = Promise.defer<void>();
        var stepResolved = item => {
            if (item.done) return result.resolve(null);
            callback(item.value);
            setImmediate(() => this.next().then(stepResolved, err => result.reject(err)));
        }
        this.next().then(stepResolved, err => result.reject(err))
        return result.promise;
    }
}
