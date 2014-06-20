var Fiber = require('./fibers');

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
exports.inc = inc;

/** Decrement the number of active fibers. */
function dec() {
    --_activeFiberCount;
}
exports.dec = dec;

var _fiberPoolSize = Fiber.poolSize;
var _activeFiberCount = 0;
//# sourceMappingURL=fiberPool.js.map
