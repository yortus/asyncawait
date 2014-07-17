import references = require('references');
import Promise = require('bluebird');
import Fiber = require('fibers');
import _ = require('../src/util');
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
            if (Fiber.current) return pipeline.acquireFiber(body);




            var fiber = {
                inSemaphore: true,
                run: (arg?) => {
                    enter(() => {

                        //TODO: needs more work...
                        var f: any = Fiber(body);
                        f.enter = fiber.enter;
                        f.leave = fiber.leave;
                        f.context = fiber.context;
                        f.co = f; //TODO: temp testing...
                        f.yield = fiber.yield; //TODO: temp testing...

                        fiber.run = (arg?) => f.run(arg);
                        fiber.throwInto = (err) => f.throwInto(err);
                        fiber.reset = () => f.reset();
                        setImmediate(() => f.run(arg));
                    });
                }
            };
            return fiber;



            //TODO: was...



            //// Route all top-level requests through the semaphore, where they will potentially wait.
            ////TODO: fix this!!!! temp...
            //return pipeline.acquireFiber(body);
            ////TODO: was...
            ////return new Promise<Fiber>((resolve: any, reject) => {
            ////    enter(() => pipeline.acquireFiber(body).then(fiber => { fiber.inSemaphore = true; resolve(fiber); }, reject));
            ////});
        },

        releaseFiber: fiber => {

            // If this fiber went through the semaphore, then we must leave through the semaphore.
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
