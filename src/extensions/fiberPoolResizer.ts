import references = require('references');
import fiberPool = require('../fiberPool'); //TODO: move fiberPool code into here?
import Extension = AsyncAwait.Extension;
export = extension;


var extension: Extension = (pipeline) => ({
    acquireFiber: body => {
        fiberPool.inc();
        return pipeline.acquireFiber(body);
    },
    releaseFiber: fiber => {
        fiberPool.dec();
        return pipeline.releaseFiber(fiber);
    }
});
