import references = require('references');
import _ = require('../util');
import Mod = AsyncAwait.Mod;
export = maxConcurrency;


/**
 *  Limits the number of calls to suspendable functions that can be concurrently executing.
 *  Excess calls are queued until a slot becomes available. This only applies to calls made
 *  from the main execution stack (i.e., not calls from other suspendable functions), to
 *  avoid race conditions.
 */
function maxConcurrency(value: number) {

    // Validate argument.
    if (!_.isNumber(value) || value < 1) throw new Error('maxConcurrency: please specify a positive numeric value');

    // Ensure mod is applied only once.
    if (size() !== null) throw new Error('maxConcurrency: mod cannot be applied multiple times');

    // Set the semaphore size.
    size(value);

    // Return the mod function.
    return (pipeline) => ({

        acquireFiber: body => {

            // For non-top-level requests, just delegate to the existing pipeline.
            // If coroutines invoke other coroutines and await their results, putting
            // the nested coroutines through the semaphore could easily lead to deadlocks.
            if (pipeline.currentCoro()) return pipeline.acquireFiber(body);

            // This is a top-level request. Return a 'placeholder' fiber whose run() method waits
            // on the semaphore and then fills itself out fully when a real fiber is available.
            var fiber: any = {
                inSemaphore: true,
                run: (arg?) => {

                    // Upon execution, enter the semaphore.
                    enter(() => {

                        // When the semaphore is ready, fill out the fiber and begin execution.
                        var f = <CoroFiber> pipeline.acquireFiber(body);
                        f.enter = fiber.enter;
                        f.leave = fiber.leave;
                        f.context = fiber.context;
                        fiber.run = (arg?) => f.run(arg);
                        fiber.throwInto = (err) => f.throwInto(err);
                        fiber.reset = () => f.reset();
                        setImmediate(() => fiber.run(arg));
                    });
                }
            };
            return fiber;
        },

        releaseFiber: fiber => {

            // If this fiber entered the semaphore, then it must leave through the semaphore.
            if (fiber.inSemaphore) {
                leave();
                fiber.inSemaphore = false;
            }

            // Delegate to the existing pipeline.
            return pipeline.releaseFiber(fiber);
        }
    });
}


/** Enter the global semaphore. */
function enter(fn: () => void) {
    if (_avail > 0) {
        --_avail;
        fn();
    } else {
        _queued.push(fn);
    }
}


/** Leave the global semaphore. */
function leave() {
    if (_queued.length > 0) {
        var fn = _queued.shift();
        fn();
    } else {
        ++_avail;
    }
}


/** Get or set the size of the global semaphore. */
function size(n?: number): number {
    if (n) {
        _avail += (n - _size);
        _size = n;
    }
    return _size;
}


// Private semaphore state.
var _size: number = null;
var _avail: number = null;
var _queued: Function[] = [];


// Private hook for unit testing.
(<any> maxConcurrency)._reset = () => {
    _size = _avail = null;
    _queued = [];
};
