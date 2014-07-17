import references = require('references');
import Mod = AsyncAwait.Mod;
export = coroPool;


/**
 *  TODO: doc
 */
var coroPool: Mod = (pipeline) => ({

    acquireCoro: (protocol, bodyFunc, bodyArgs?, bodyThis?) => {
        var co = bodyFunc.pooled;
        if (co) {
            bodyFunc.pooled = null;
            co.bodyArgs = bodyArgs;
            co.bodyThis = bodyThis;
            return co;
        }
        else {
            return pipeline.acquireCoro(protocol, bodyFunc, bodyArgs, bodyThis);
        }
    },

    releaseCoro: co => {
        if (co.bodyFunc.pooled) {
            pipeline.releaseCoro(co);
        }
        else {
            co.bodyFunc.pooled = co;
        }
    }
});
