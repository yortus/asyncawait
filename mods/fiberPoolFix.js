var Fiber = require('fibers');


//TODO: doc...
var extension = function (pipeline) {
    return ({
        acquireFiber: function (body) {
            inc();
            return pipeline.acquireFiber(body);
        },
        releaseFiber: function (fiber) {
            dec();
            return pipeline.releaseFiber(fiber);
        }
    });
};

// The following functionality prevents memory leaks in node-fibers
// by actively managing Fiber.poolSize. For more information, see
// https://github.com/laverdet/node-fibers/issues/169.
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

var _fiberPoolSize = Fiber.poolSize;
var _activeFiberCount = 0;
module.exports = extension;
//# sourceMappingURL=fiberPoolFix.js.map
