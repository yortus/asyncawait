
//TODO: rename this file... should be jointProtocol


// TODO: change co to fi throughout project and use correct type (Fiber/FiberEx)



import references = require('references');
import assert = require('assert');
import Fiber = require('fibers');
import _ = require('./util');
import Pipeline = AsyncAwait.Pipeline;
import AsyncProtocol = AsyncAwait.Async.Protocol;
export = pipeline;


/**
 *  A hash of functions and properties that are used internally at various
 *  stages of async/await handling. The pipeline may be augmented by mods,
 *  which are loaded via the use(...) API method.
 */
var pipeline = {

    // The following methods comprise the overridable part of the pipeline API.
    acquireFiber: <typeof defaultPipeline.acquireFiber> null,
    releaseFiber: <typeof defaultPipeline.releaseFiber> null,
    createFiberBody: <typeof defaultPipeline.createFiberBody> null,

    // The remaining items are for internal use and may not be overriden.
    currentFiber: () => Fiber.current,
    suspendFiber: (val?) => Fiber.yield(val),
    isCurrent: co => { var f = Fiber.current; return f && f.id === co.id; },
    nextCoroId: 1,
    continueAfterYield: {}, /* sentinal value */
    notHandled: {}, /* sentinal value */
    restoreDefaults: () => _.mergeProps(pipeline, defaultPipeline),

    //TODO: temp testing... needed to move it to avoid circular ref cpsKeyword->cps->awaitBuilder->extensibility->cpsKeyword
    continuation: function continuation() {
        var co = pipeline.currentFiber();
        var i = co.awaiting.length++;
        return function continue_(err, result) {
            co.awaiting[i](err, result);
            co = null;
        };
    }
};


/** Default implementations for the overrideable pipeline methods. */
var defaultPipeline: Pipeline = {

    /** Create and return a new Fiber instance. */
    acquireFiber: (asyncProtocol: AsyncProtocol, bodyFunc: Function, bodyThis: any, bodyArgs: any[]) => {
        var fiberBody = pipeline.createFiberBody(asyncProtocol, function getFi() { return fi; });
        var fi = Fiber(fiberBody);
        fi.id = ++pipeline.nextCoroId;
        fi.bodyFunc = bodyFunc;
        fi.bodyThis = bodyThis;
        fi.bodyArgs = bodyArgs;
        fi.context = {};
        fi.awaiting = [];
        fi.suspend = (error?: Error, value?) => asyncProtocol.suspend(fi, error, value);
        fi.resume = (error?: Error, value?) => asyncProtocol.resume(fi, error, value);
        return fi;
    },

    /** Ensure the Fiber instance is disposed of cleanly. */
    releaseFiber: (asyncProtocol: AsyncProtocol, fi: Fiber) => {
        fi.suspend = null;
        fi.resume = null;
        fi.context = null;
        fi.bodyFunc = null;
        fi.bodyThis = null;
        fi.bodyArgs = null;
    },

    /** Create the body function to be executed inside a fiber. */
    createFiberBody: (asyncProtocol: AsyncProtocol, getFi: () => Fiber) => {

        // V8 may not optimise the following function due to the presence of
        // try/catch/finally. Therefore it does as little as possible, only
        // referencing the optimisable closures prepared below.
        function fiberBody() {
            try { tryBlock(); }
            catch (err) { catchBlock(err); }
            finally { setImmediate(finallyBlock); /* Ensure the fiber exits before we clean it up. */ }
        }

        // These references are shared by the closures below.
        var fi: Fiber, result, error;

        // Define the details of the body function's try/catch/finally clauses.
        function tryBlock() {

            // Lazy-load the fiber instance to use throughout the body function. This mechanism
            // means that the instance need not be available at the time createFiberBody() is called.
            fi = fi || getFi();

            // Clear the error state.
            error = null;

            // Execute the entirety of bodyFunc, using the fastest feasible invocation approach.
            var f = fi.bodyFunc, t = fi.bodyThis, a = fi.bodyArgs, noThis = !t || t === global;
            if (noThis && a) {
                switch (a.length) {
                    case 0: result = f(); break;
                    case 1: result = f(a[0]); break;
                    case 2: result = f(a[0], a[1]); break;
                    default: result = f.apply(null, a);
                }
            }
            else {
                result = !noThis ? f.apply(t, a) : f();
            }
        }
        function catchBlock(err) {
            error = err;
        }
        function finallyBlock() {
            asyncProtocol.end(fi, error, result);
            pipeline.releaseFiber(asyncProtocol, fi);
        }

        // Return the completed fiberBody closure.
        return fiberBody;
    }
};
