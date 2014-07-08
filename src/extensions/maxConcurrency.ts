import references = require('references');
import Promise = require('bluebird');
import Fiber = require('../fibers');
import semaphore = require('../semaphore'); //TODO: move semaphore code into here?
import Extension = AsyncAwait.Extension;
export = extension;


var extension: Extension = (pipeline) => ({
    acquireFiber: body => {

        if (Fiber.current) return pipeline.acquireFiber(body);

        return new Promise<Fiber>((resolve: any, reject) => {
            semaphore.enter(() => {
                pipeline.acquireFiber(body).then(resolve, reject);
            });
        });
    },
    releaseFiber: fiber => {
        semaphore.leave(); //TODO: only if entered...
        return pipeline.releaseFiber(fiber);
    }
});
