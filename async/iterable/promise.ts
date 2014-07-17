import references = require('references');
import oldBuilder = require('../../src/asyncBuilder');
import assert = require('assert');
import Promise = require('bluebird');
import _ = require('../../src/util');
export = builder;


var builder = oldBuilder.derive<AsyncAwait.Async.IterablePromiseBuilder>(() => ({
    invoke: (co) => {
        var ctx = co.context = {
            nextResolver: null,
            done: false
        };
        var next = () => {
            var res = ctx.nextResolver = Promise.defer<any>();
            ctx.done ? res.reject(new Error('iterated past end')) : co.enter();
            return ctx.nextResolver.promise;
        }
        return new AsyncIterator(next);
    },
    return: (ctx, result) => {
        ctx.done = true;
        ctx.nextResolver.resolve({ done: true, value: result });
    },
    throw: (ctx, error) => {
        ctx.nextResolver.reject(error);
    },
    yield: (ctx, value) => {
        var result = { done: false, value: value };
        ctx.nextResolver.resolve(result);
    }
}));


class AsyncIterator {

    constructor(public next: () => Promise<any>) { }

    forEach(callback: (value) => void) {

        // Ensure that a single argument has been supplied, which is a function.
        assert(arguments.length === 1, 'forEach(): expected a single argument');
        assert(_.isFunction(callback), 'forEach(): expected argument to be a function');

        // Asynchronously call next() until done.
        var result = Promise.defer<void>();
        var stepNext = () => this.next().then(stepResolved, err => {
            result.reject(err);
        });
        var stepResolved = item => {
            if (item.done) return result.resolve(item.value);
            callback(item.value);
            setImmediate(stepNext);
        }
        stepNext();
        return result.promise;
    }
}
