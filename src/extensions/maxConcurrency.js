var Promise = require('bluebird');
var Fiber = require('../fibers');


function factory(maxConcurrency) {
    size(maxConcurrency);
    return function (pipeline) {
        return ({
            acquireFiber: function (body) {
                if (Fiber.current)
                    return pipeline.acquireFiber(body);

                return new Promise(function (resolve, reject) {
                    enter(function () {
                        pipeline.acquireFiber(body).then(resolve, reject);
                    });
                });
            },
            releaseFiber: function (fiber) {
                leave(); //TODO: only if entered...
                return pipeline.releaseFiber(fiber);
            }
        });
    };
}

//TODO add explanation here
//TODO: optimal? Is this used even if no maxConcurrency specified?
/** Enter the global semaphore. */
function enter(fn) {
    if (_avail > 0) {
        --_avail;
        fn();
    } else {
        _queued.push(fn);
    }
}

/** Leave the global semaphore. */
function leave() {
    if (_queued.length > 0) {
        var fn = _queued.shift();
        fn();
    } else {
        ++_avail;
    }
}

/** Get or set the size of the global semaphore. */
function size(n) {
    if (n) {
        _avail += (n - _size);
        _size = n;
    }
    return _size;
}

var _size = 1000000;

var _avail = 1000000;

var _queued = [];
module.exports = factory;
//# sourceMappingURL=maxConcurrency.js.map
