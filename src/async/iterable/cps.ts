import references = require('references');
import assert = require('assert');
import oldBuilder = require('../../asyncBuilder');
import _ = require('../../util');
export = newBuilder;


/** Fiber interface extended with type information for 'context'. */
interface FiberEx extends Fiber {
    context: {
        nextCallback: (error?, value?) => void;
        done: boolean;
    };
}


var newBuilder = oldBuilder.mod({

    name: 'iterable.cps',

    type: <AsyncAwait.Async.IterableCPSBuilder> null,

    override: (base, options) => ({

        begin: (fi: FiberEx) => {
            var ctx = fi.context = { nextCallback: null, done: false };
            var next = (callback?: (err, item?: { done: boolean; value?: any; }) => void) => {
                ctx.nextCallback = callback || _.empty;
                if (ctx.done) ctx.nextCallback(new Error('iterated past end')); else fi.resume();
            }
            return new AsyncIterator(next);
        },

        suspend: (fi: FiberEx, error?, value?) => {
            if (error) throw error; // NB: not handled - throw in fiber
            fi.context.nextCallback(null, { done: false, value: value });
            _.yieldCurrentFiber();
        },

        end: (fi: FiberEx, error?, value?) => {
            var ctx = fi.context;
            ctx.done = true;
            if (error) ctx.nextCallback(error); else ctx.nextCallback(null, { done: true, value: value });
        }
    })
});


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
