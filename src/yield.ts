import _refs = require('_refs');
import Fiber = require('fibers');
import Promise = require('bluebird');
export = yield_;


// This is the yield() API function (see docs).
var yield_ = function(expr) {

    console.log('in yield()');
    Fiber.yield(expr);
}
