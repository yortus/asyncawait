import _refs = require('_refs');
import Fiber = require('fibers');
import Promise = require('bluebird');
export = yield_;


// This is the yield() API function (see docs).
var yield_ = function(expr) {
    Fiber.current['value'].resolve(expr);
    Fiber.current['done'].resolve(false);
    Fiber.yield();
}
