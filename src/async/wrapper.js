var Fiber = require('fibers');
var AsyncOutput = require('./asyncOutput');


//TODO: rename to runInFiber(runCtx: RunContext)
/**
* The wrapper() function accepts a Context instance, and calls the wrapped function which is
* described in the context. The result of the call is used to resolve the context's promise.
* If an exception is thrown, the context's promise is rejected. This function must take all
* its information in a single argument (i.e. the context), because it is called via
* Fiber#run(), which accepts at most one argument.
*/
function wrapper(ctx) {
    try  {
        // Keep track of how many fibers are active
        adjustFiberCount(+1);

        // Call the wrapped function. It may get suspended at await and/or yield calls.
        var result = ctx.wrapped.apply(ctx.thisArg, ctx.argsAsArray);

        switch (ctx.output) {
            case 0 /* Promise */:
                ctx.value.resolve(result);
                break;
            case 1 /* PromiseIterator */:
                ctx.value.resolve(undefined);
                ctx.done.resolve(true);
                break;
        }
    } catch (err) {
        switch (ctx.output) {
            case 0 /* Promise */:
                ctx.value.reject(err);
                break;
            case 1 /* PromiseIterator */:
                ctx.value.reject(err);
                ctx.done.resolve(true);
                break;
        }
    } finally {
        // Keep track of how many fibers are active
        adjustFiberCount(-1);

        // TODO: for semaphores
        ctx.semaphore.leave();
    }
}

/**
* The following functionality prevents memory leaks in node-fibers by actively managing Fiber.poolSize.
* For more information, see https://github.com/laverdet/node-fibers/issues/169.
*/
var fiberPoolSize = Fiber.poolSize;
var activeFiberCount = 0;
function adjustFiberCount(delta) {
    activeFiberCount += delta;
    if (activeFiberCount >= fiberPoolSize) {
        fiberPoolSize += 100;
        Fiber.poolSize = fiberPoolSize;
    }
}
module.exports = wrapper;
//# sourceMappingURL=wrapper.js.map
