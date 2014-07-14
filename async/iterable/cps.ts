import references = require('references');
import assert = require('assert');
import oldBuilder = require('../../src/asyncBuilder');
import _ = require('../../src/util');
export = builder;


var builder = oldBuilder.derive<AsyncAwait.Async.IterableCPSBuilder>(() => ({
    clear: (co) => {
        co.nextCallback = null;
        co.done = false;
    },
    invoke: (co) => {
        var next = (callback?: (err, item?: { done: boolean; value?: any; }) => void) => {
            co.nextCallback = callback || _.empty;
            co.done ? co.nextCallback(new Error('iterated past end')) : co.enter();
        }
        return new AsyncIterator(next);
    },
    return: (ctx, result) => {
        ctx.done = true;
        ctx.nextCallback(null, { done: true, value: result });
    },
    throw: (ctx, error) => {
        ctx.nextCallback(error);
    },
    yield: (ctx, value) => {
        var result = { done: false, value: value };
        ctx.nextCallback(null, result);
    }
}));


class AsyncIterator {

    constructor(public next: (callback?: (err, item?: { done: boolean; value?: any; }) => void) => void) { }

    forEach(callback: (value) => void, done_?: (err, value?) => void) {

        // Ensure at least one argument has been supplied, which is a function.
        assert(arguments.length >= 1, 'forEach(): expected at least one argument');
        assert(_.isFunction(callback), 'forEach(): expected argument to be a function');

        // Asynchronously call next() until done.
        var done = done_ || _.empty;
        var stepNext = () => this.next((err, item) => err ? done(err) : stepResolved(item));
        var stepResolved = item => {
            if (item.done) return done(null, item.value);
            callback(item.value);
            setImmediate(stepNext);
        }
        stepNext();
    }
}
