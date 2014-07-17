var Fiber = require('fibers');
var _ = require('../src/util');


/**
*  Limits the number of calls to suspendable functions that can be concurrently executing.
*  Excess calls are queued until a slot becomes available. This only applies to calls made
*  from the main execution stack (i.e., not calls from other suspendable functions), to
*  avoid race conditions.
*/
function maxConcurrency(value) {
    // Validate argument.
    if (!_.isNumber(value) || value < 1)
        throw new Error('maxConcurrency: please specify a positive numeric value');

    // Ensure mod is applied only once.
    if (size() !== null)
        throw new Error('maxConcurrency: mod cannot be applied multiple times');

    // Set the semaphore size.
    size(value);

    // Return the mod function.
    return function (pipeline) {
        return ({
            acquireFiber: function (body) {
                // For non-top-level requests, just delegate to the existing pipeline.
                if (Fiber.current)
                    return pipeline.acquireFiber(body);

                var fiber = {
                    inSemaphore: true,
                    run: function (arg) {
                        enter(function () {
                            //TODO: needs more work...
                            var f = Fiber(body);
                            f.enter = fiber.enter;
                            f.leave = fiber.leave;
                            f.context = fiber.context;
                            f.co = f; //TODO: temp testing...
                            f.yield = fiber.yield; //TODO: temp testing...

                            fiber.run = function (arg) {
                                return f.run(arg);
                            };
                            fiber.throwInto = function (err) {
                                return f.throwInto(err);
                            };
                            fiber.reset = function () {
                                return f.reset();
                            };
                            setImmediate(function () {
                                return f.run(arg);
                            });
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
            releaseFiber: function (fiber) {
                // If this fiber went through the semaphore, then we must leave through the semaphore.
                if (fiber.inSemaphore) {
                    leave();
                    fiber.inSemaphore = false;
                }

                // Delegate to the existing pipeline.
                return pipeline.releaseFiber(fiber);
            }
        });
    };
}

/** Enter the global semaphore. */
function enter(fn) {
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
function size(n) {
    if (n) {
        _avail += (n - _size);
        _size = n;
    }
    return _size;
}

// Private semaphore state.
var _size = null;
var _avail = null;
var _queued = [];

// Private hook for unit testing.
maxConcurrency._reset = function () {
    _size = _avail = null;
    _queued = [];
};
module.exports = maxConcurrency;
//# sourceMappingURL=maxConcurrency.js.map
