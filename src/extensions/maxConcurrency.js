var Promise = require('bluebird');
var Fiber = require('../fibers');
var semaphore = require('../semaphore');


var extension = function (pipeline) {
    return ({
        acquireFiber: function (body) {
            if (Fiber.current)
                return pipeline.acquireFiber(body);

            return new Promise(function (resolve, reject) {
                semaphore.enter(function () {
                    pipeline.acquireFiber(body).then(resolve, reject);
                });
            });
        },
        releaseFiber: function (fiber) {
            semaphore.leave(); //TODO: only if entered...
            return pipeline.releaseFiber(fiber);
        }
    });
};
module.exports = extension;
//# sourceMappingURL=maxConcurrency.js.map
