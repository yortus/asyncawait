import _refs = require('_refs');
import Fiber = require('fibers');
import RunContext = require('./runContext');
import CallbackArg = require('./callbackArg');
import ReturnValue = require('./returnValue');
export = runInFiber;


/**
 * The runInFiber() function provides the prolog/epilog wrapper code for running a function inside
 * a fiber. The runInFiber() function accepts a RunContext instance, and calls the wrapped function
 * specified there. The final return/throw value of the wrapped function is used to notify the 
 * promise resolver and/or callback specified in the RunContext. This function must take all its
 * information in a single argument because it is called via Fiber#run(), which accepts one argument.
 */
function runInFiber(runCtx: RunContext) {
    try {

        // Maintain an accurate count of currently active fibers, for pool management.
        adjustFiberCount(+1);

        // Call the wrapped function. It may be suspended several times (at await and/or yield calls).
        var result = runCtx.wrapped.apply(runCtx.thisArg, runCtx.argsAsArray);

        // If we get here, the wrapped function finished normally (ie via explicit or implicit return).
        if (runCtx.callback) runCtx.callback(null, result);
        if (runCtx.resolver) runCtx.resolver.resolve(result);
    }
    catch (err) {

        // If we get here, the wrapped function had an unhandled exception.
        if (runCtx.callback) runCtx.callback(err);
        if (runCtx.resolver) runCtx.resolver.reject(err);
    }
    finally {

        // Maintain an accurate count of currently active fibers, for pool management.
        adjustFiberCount(-1);

        // Execute the done() callback, if provided.
        if (runCtx.done) runCtx.done();
    }
}


/**
 * The following functionality prevents memory leaks in node-fibers by actively managing Fiber.poolSize.
 * For more information, see https://github.com/laverdet/node-fibers/issues/169.
 */
function adjustFiberCount(delta: number) {
    activeFiberCount += delta;
    if (activeFiberCount >= fiberPoolSize) {
        fiberPoolSize += 100;
        Fiber.poolSize = fiberPoolSize;
    }
}
var fiberPoolSize = Fiber.poolSize;
var activeFiberCount = 0;
