var Fiber = require('fibers');


// This is the yield() API function (see docs).
var yield_ = function (expr) {
    console.log('in yield()');
    Fiber.yield(expr);
};
module.exports = yield_;
