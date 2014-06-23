import references = require('references');
import oldBuilder = require('../../src/asyncBuilder');
import assert = require('assert');
import Promise = require('bluebird');
import transfer = require('../../src/transfer');
export = builder;


var builder = oldBuilder.mod<AsyncAwait.Async.IterablePromiseBuilder>({
    methods: () => ({
        invoke: (co) => {
            co.nextResolver = <Promise.Resolver<any>> null;
            co.done = false;
            var next = () => {
                var res = co.nextResolver = Promise.defer<any>();
                co.done ? res.reject(new Error('iterated past end')) : transfer(co);
                return co.nextResolver.promise;
            }
            return new AsyncIterator(next);
        },
        return: (co, result) => {
            co.done = true;
            co.nextResolver.resolve({ done: true, value: result });
        },
        throw: (co, error) => {
            co.nextResolver.reject(error);
        },
        yield: (co, value) => {
            var result = { done: false, value: value };
            co.nextResolver.resolve(result);
            transfer();
        },
        finally: (co) => {
            co.nextResolver = null;
        }
    })
});


class AsyncIterator {

    constructor(public next: () => Promise<any>) { }

    forEach(callback: (value) => void) {

        // Ensure that a single argument has been supplied, which is a function.
        assert(arguments.length === 1, 'forEach(): expected a single argument');
        assert(typeof(callback) === 'function', 'forEach(): expected argument to be a function');

        // Asynchronously call next() until done.
        var result = Promise.defer<void>();
        var stepNext = () => this.next().then(stepResolved, err => result.reject(err));
        var stepResolved = item => {
            if (item.done) return result.resolve(item.value);
            callback(item.value);
            setImmediate(stepNext);
        }
        stepNext();
        return result.promise;
    }
}
