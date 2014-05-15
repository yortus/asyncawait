import references = require('references');
import _ = require('lodash');
import Protocol = require('./base');
export = IterableCPSProtocol;


class IterableCPSProtocol extends Protocol {
    constructor() { super(); }

    invoke(func: Function, this_: any, args: any[]): any {
        super.invoke(func, this_, args);
        return new AsyncIterator(this);
    }

    invokeNext(callback: (err, item?: { done: boolean; value?: any; }) => void) {
        this.nextCallback = callback;
        setImmediate(() => this.done ? callback(new Error('iterated past end')) : this.resume());
    }

    return(result) {
        this.done = true;
        this.nextCallback(null, { done: true, value: result });
    }

    throw(error) {
        this.nextCallback(error);
    }

    yield(value) {
        var result = { done: false, value: value };
        this.nextCallback(null, result);
        this.suspend();
    }

    private nextCallback: (err, item?: { done: boolean; value?: any; }) => void = null;
    private done: boolean;
}


class AsyncIterator {

    constructor(private iterable: IterableCPSProtocol) { }

    next(callback?: (err, item?: { done: boolean; value?: any; }) => void) {
        return this.iterable.invokeNext(callback || nullFunc);
    }

    forEach(callback: (value) => void, done_?: (err, value?) => void) {

        // Ensure at least one argument has been supplied, which is a function.
        if (arguments.length < 1) throw new Error('forEach(): expected at least one argument');
        if (!_.isFunction(callback)) throw new Error('forEach(): expected argument to be a function');

        var done = done_ || nullFunc;
        var stepNext = () => this.next((err, item) => err ? done(err) : stepResolved(item));
        var stepResolved = item => {
            if (item.done) return done(null, item.value);
            callback(item.value);
            setImmediate(stepNext);
        }
        stepNext();
    }
}


function nullFunc() { }
