import references = require('references');
import _ = require('../util');
import Mod = AsyncAwait.Mod;
import AsyncProtocol = AsyncAwait.Async.Protocol;


/** Fiber interface extended with semaphore info. */
interface FiberEx extends Fiber {
    inSemaphore: boolean;
}


/**
 *  Limits the number of calls to suspendable functions that can be concurrently executing.
 *  Excess calls are queued until a slot becomes available. This only applies to calls made
 *  from the main execution stack (i.e., not calls from other suspendable functions), to
 *  prevent deadlocks.
 */
export var mod: Mod = {

    name: 'maxSlots',

    override: (base, options) => {

        // Do nothing if the option is not selected.
        var n = options.maxSlots;
        if (!n || !_.isNumber(n)) return;

        // Set the semaphore size.
        semaphoreSize(n);

        // Return the joint protocol overrides.
        return {

            /** Create and return a new Fiber instance. */
            acquireFiber: (asyncProtocol: AsyncProtocol) => {

                // If fiber A invokes fiber B and awaits its results, then suspending fiber B until the
                // semaphore clears could easily lead to deadlocks. Therefore, for nested fiber acquisitions,
                // skip the semaphore and delegate to the base protocol. This means 'maxSlots' affects
                // only the concurrency factor of fibers called directly from the main execution stack.
                if (!!_.currentFiber()) return base.acquireFiber(asyncProtocol);

                // This is a top-level acquisition. Return a 'fake' fiber whose resume() method waits
                // on the semaphore, and then fills itself out fully and continues when the semaphore is ready.
                var fake: any = {
                    inSemaphore: true,
                    context: {},
                    resume: (error?, value?) => {

                        // Upon execution, enter the semaphore.
                        enterSemaphore(() => {

                            // When the semaphore is ready, acquire a real fiber from the joint protocol.
                            var real = <FiberEx> base.acquireFiber(asyncProtocol);

                            // There may still be outstanding references to the fake fiber,
                            // so ensure its suspend() and resume() methods call the real fiber.
                            fake.suspend = real.suspend;
                            fake.resume = real.resume;

                            // The context and target are already initialised on the fake, so copy them to real.
                            real.context = fake.context;
                            base.setFiberTarget(real, fake.bodyFunc, fake.bodyThis, fake.bodyArgs);

                            // Mark the real fiber so it is properly handled by releaseFiber().
                            real.inSemaphore = true;

                            // Begin execution in the real fiber.
                            real.resume(error, value);
                        });
                    }
                };
                return fake;
            },

            /** Ensure the Fiber instance is disposed of cleanly. */
            releaseFiber: (asyncProtocol: AsyncProtocol, fi: FiberEx) => {

                // If this fiber entered through the semaphore, then it must leave through the semaphore.
                if (fi.inSemaphore) {
                    fi.inSemaphore = false;
                    leaveSemaphore();
                }

                // Delegate to the base protocol.
                return base.releaseFiber(asyncProtocol, fi);
            },

            shutdown: () => {
                _size = _avail = null;
                _queued = [];
                base.shutdown();
            }

        };
    },

    defaults: {
        maxSlots: null
    }
};


/** Enter the global semaphore. */
function enterSemaphore(fn: () => void) {
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
function semaphoreSize(n?: number): number {
    if (n) {
        _avail += (n - _size);
        _size = n;
    }
    return _size;
}


// Private semaphore state.
//TODO: should this be global, in case multiple asyncawait instances are loaded in the process?
var _size: number = null;
var _avail: number = null;
var _queued: Function[] = [];
