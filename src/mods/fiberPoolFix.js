var Fiber = require('fibers');


/**
*  Automatically manages Fiber.poolSize to work around an issue with node-fibers.
*  Apply this mod when the peak number of concurrently executing fibers (there is
*  one for each currently executing suspendable function) is likely to exceed 120.
*  Memory leaks and slowdowns under heavy load is symptomatic of the issue this
*  mod addresses.
*  For more details see https://github.com/laverdet/node-fibers/issues/169.
*/
var fiberPoolFix = {
    apply: function (pipeline, options) {
        // Override the pipeline if the option is selected.
        return (!options.fiberPoolFix) ? null : {
            acquireFiber: function (body) {
                inc();
                return pipeline.acquireFiber(body);
            },
            releaseFiber: function (fiber) {
                dec();
                return pipeline.releaseFiber(fiber);
            }
        };
    },
    reset: function () {
        _fiberPoolSize = Fiber.poolSize;
        _activeFiberCount = 0;
    },
    defaults: {
        fiberPoolFix: false
    }
};

/** Increment the number of active fibers. */
function inc() {
    ++_activeFiberCount;
    if (_activeFiberCount >= _fiberPoolSize) {
        _fiberPoolSize += 100;
        Fiber.poolSize = _fiberPoolSize;
    }
}

/** Decrement the number of active fibers. */
function dec() {
    --_activeFiberCount;
}

// Private state.
//TODO: should this be global, in case multiple asyncawait instances are loaded in the process?
var _fiberPoolSize = Fiber.poolSize;
var _activeFiberCount = 0;
module.exports = fiberPoolFix;
//# sourceMappingURL=fiberPoolFix.js.map
