var Fiber = require('fibers');

function inc() {
    ++_activeFiberCount;
    if (_activeFiberCount >= _fiberPoolSize) {
        _fiberPoolSize += 100;
        Fiber.poolSize = _fiberPoolSize;
    }
}
exports.inc = inc;

function dec() {
    --_activeFiberCount;
}
exports.dec = dec;

var _fiberPoolSize = Fiber.poolSize;
var _activeFiberCount = 0;
//# sourceMappingURL=fiberPool.js.map
