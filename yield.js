var Fiber = require('fibers');


// This is the yield() API function (see docs).
var yield_ = function (expr) {
    Fiber.current['value'].resolve(expr);
    Fiber.current['done'].resolve(false);
    Fiber.yield();
};
module.exports = yield_;
