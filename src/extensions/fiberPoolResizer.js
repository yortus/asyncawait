var fiberPool = require('../fiberPool');


var extension = function (pipeline) {
    return ({
        acquireFiber: function (body) {
            fiberPool.inc();
            return pipeline.acquireFiber(body);
        },
        releaseFiber: function (fiber) {
            fiberPool.dec();
            return pipeline.releaseFiber(fiber);
        }
    });
};
module.exports = extension;
//# sourceMappingURL=fiberPoolResizer.js.map
