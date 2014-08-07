var _ = require('../util');


/**
*  Limits the number of calls to suspendable functions that can be concurrently executing.
*  Excess calls are queued until a slot becomes available. This only applies to calls made
*  from the main execution stack (i.e., not calls from other suspendable functions), to
*  prevent deadlocks.
*/
var maxSlots = {
    name: 'maxSlots',
    overridePipeline: function (base, options) {
        // Do nothing if the option is not selected.
        var n = options.maxSlots;
        if (!n || !_.isNumber(n))
            return;

        // Set the semaphore size.
        semaphoreSize(n);

        // Return the pipeline overrides.
        return {
            /** Create and return a new Coroutine instance. */
            acquireCoro: function (asyncProtocol, bodyFunc, bodyThis, bodyArgs) {
                // For non-top-level acquisitions, just delegate to the existing pipeline.
                // If coroutines invoke other coroutines and await their results, putting
                // the nested coroutines through the semaphore could easily lead to deadlocks.
                if (!!base.currentCoro())
                    return base.acquireCoro(asyncProtocol, bodyFunc, bodyThis, bodyArgs);

                // This is a top-level acquisition. Return a 'placeholder' coroutine whose resume() method waits
                // on the semaphore, and then fills itself out fully and continues when the semaphore is ready.
                var co = {
                    inSemaphore: true,
                    context: {},
                    resume: function (error, value) {
                        // Upon execution, enter the semaphore.
                        enterSemaphore(function () {
                            // When the semaphore is ready, acquire a coroutine from the pipeline.
                            var c = base.acquireCoro(asyncProtocol, bodyFunc, bodyThis, bodyArgs);

                            // There may still be outstanding references to the placeholder coroutine,
                            // so ensure its suspend() and resume() methods call the real coroutine.
                            co.suspend = c.suspend;
                            co.resume = c.resume;

                            // The context is already initialised on the placeholder, so copy in back.
                            c.context = co.context;

                            // Mark this coroutine so it is properly handled by releaseCoro().
                            c.inSemaphore = true;

                            // Begin execution.
                            co.resume(error, value);
                        });
                    }
                };
                return co;
            },
            /** Ensure the Coroutine instance is disposed of cleanly. */
            releaseCoro: function (asyncProtocol, co) {
                // If this coroutine entered through the semaphore, then it must leave through the semaphore.
                if (co.inSemaphore) {
                    co.inSemaphore = false;
                    leaveSemaphore();
                }

                // Delegate to the existing pipeline.
                return base.releaseCoro(asyncProtocol, co);
            }
        };
    },
    reset: function () {
        _size = _avail = null;
        _queued = [];
    },
    defaultOptions: {
        maxSlots: null
    }
};

/** Enter the global semaphore. */
function enterSemaphore(fn) {
    if (_avail > 0) {
        --_avail;
        fn();
    } else {
        _queued.push(fn);
    }
}

/** Leave the global semaphore. */
function leaveSemaphore() {
    if (_queued.length > 0) {
        var fn = _queued.shift();
        fn();
    } else {
        ++_avail;
    }
}

/** Get or set the size of the global semaphore. */
function semaphoreSize(n) {
    if (n) {
        _avail += (n - _size);
        _size = n;
    }
    return _size;
}

// Private semaphore state.
//TODO: should this be global, in case multiple asyncawait instances are loaded in the process?
var _size = null;
var _avail = null;
var _queued = [];
module.exports = maxSlots;
//# sourceMappingURL=maxSlots.js.map
