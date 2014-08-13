import references = require('references');
import assert = require('assert');
import Promise = require('bluebird');
import oldBuilder = require('../../asyncBuilder');
import _ = require('../../util');
export = newBuilder;


/** Fiber interface extended with type information for 'context'. */
interface FiberEx extends Fiber {
    context: {
        nextResolver: Promise.Resolver<any>;
        done: boolean;
    };
}


var newBuilder = oldBuilder.mod({

    name: 'iterable.promise',

    type: <AsyncAwait.Async.IterablePromiseBuilder> null,

    override: (base, options) => ({

        begin: (fi: FiberEx) => {
            var ctx = fi.context = { nextResolver: null, done: false };
            var next = () => {
                var res = ctx.nextResolver = Promise.defer<any>();
                if (ctx.done) res.reject(new Error('iterated past end')); else fi.resume();
                return ctx.nextResolver.promise;
            }
            return new AsyncIterator(next);
        },

        suspend: (fi: FiberEx, error?, value?) => {
            if (error) throw error; // NB: not handled - throw in fiber
            fi.context.nextResolver.resolve({ done: false, value: value });
            _.yieldCurrentFiber();
        },

        end: (fi: FiberEx, error?, value?) => {
            var ctx = fi.context;
            ctx.done = true;
            if (error) ctx.nextResolver.reject(error); else ctx.nextResolver.resolve({ done: true, value: value });
        }
    })
});


//TODO: also support send(), throw(), close()...
//TODO: see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators
//TODO: also for other iterable variants...
class AsyncIterator {

    constructor(public next: () => Promise<any>) { }

    forEach(callback: (value) => void) {

        // Ensure that a single argument has been supplied, which is a function.
        assert(arguments.length === 1, 'forEach(): expected a single argument');
        assert(_.isFunction(callback), 'forEach(): expected argument to be a function');

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
