
/**
*  TODO: doc
*/
var coroPool = function (pipeline) {
    return ({
        acquireCoro: function (protocol, bodyFunc, bodyArgs, bodyThis) {
            var co = bodyFunc.pooled;
            if (co) {
                bodyFunc.pooled = null;
                co.bodyArgs = bodyArgs;
                co.bodyThis = bodyThis;
                return co;
            } else {
                return pipeline.acquireCoro(protocol, bodyFunc, bodyArgs, bodyThis);
            }
        },
        releaseCoro: function (protocol, co) {
            if (co.bodyFunc.pooled) {
                pipeline.releaseCoro(protocol, co);
            } else {
                co.bodyFunc.pooled = co;
            }
        }
    });
};
module.exports = coroPool;
//# sourceMappingURL=coroPool.js.map
