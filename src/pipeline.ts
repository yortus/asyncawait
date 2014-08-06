import references = require('references');
import assert = require('assert');
import Fiber = require('fibers');
import _ = require('./util');
import Pipeline = AsyncAwait.Pipeline;
import Protocol = AsyncAwait.Async.Protocol;
export = pipeline;


/**
 *  A hash of functions and properties that are used internally at various
 *  stages of async/await handling. The pipeline may be augmented by mods,
 *  which are loaded via the use(...) API method.
 */
var pipeline = {

    // The following methods comprise the overridable part of the pipeline API.
    acquireCoro: <typeof defaultPipeline.acquireCoro> null,
    releaseCoro: <typeof defaultPipeline.releaseCoro> null,
    acquireFiber: <typeof defaultPipeline.acquireFiber> null,
    releaseFiber: <typeof defaultPipeline.releaseFiber> null,
    createFiberBody: <typeof defaultPipeline.createFiberBody> null,

    // The remaining items are for internal use and may not be overriden.
    currentCoro: () => <CoroFiber> Fiber.current,
    suspendCoro: (val?) => Fiber.yield(val),
    isCurrent: co => { var f = <CoroFiber> Fiber.current; return f && f.id === co.id; },
    nextCoroId: 1,
    continueAfterYield: {}, /* sentinal value */
    notHandled: {}, /* sentinal value */
    restoreDefaults: () => _.mergeProps(pipeline, defaultPipeline),

    //TODO: temp testing... needed to move it to avoid circular ref cpsKeyword->cps->awaitBuilder->extensibility->cpsKeyword
    continuation: function continuation() {
        var co = pipeline.currentCoro();
        var i = co.awaiting.length++;
        return function continue_(err, result) {
            co.awaiting[i](err, result);
            co = null;
        };
    }
};


/** Default implementations for the overrideable pipeline methods. */
var defaultPipeline: Pipeline = {

    /** Create and return a new Coroutine instance. */
    acquireCoro: (protocol: Protocol, bodyFunc: Function, bodyThis: any, bodyArgs: any[]) => {
        var fiberBody = pipeline.createFiberBody(protocol, function getCo() { return co; });
        var co = <CoroFiber> pipeline.acquireFiber(fiberBody);
        co.id = ++pipeline.nextCoroId;
        co.bodyFunc = bodyFunc;
        co.bodyThis = bodyThis;
        co.bodyArgs = bodyArgs;
        co.context = {};
        co.awaiting = [];
        co.suspend = (error?: Error, value?) => protocol.suspend(co, error, value);
        co.resume = (error?: Error, value?) => protocol.resume(co, error, value);
        return co;
    },

    /** Ensure the Coroutine instance is disposed of cleanly. */
    releaseCoro: (protocol: Protocol, co: CoroFiber) => {
        co.enter = null;
        co.leave = null;
        co.context = null;
        co.bodyFunc = null;
        co.bodyThis = null;
        co.bodyArgs = null;
    },

    /** Create and return a new Fiber instance. */
    acquireFiber: (body: () => any): Fiber => {
        return Fiber(body);
    },

    /** Ensure the Fiber instance is disposed of cleanly. */
    releaseFiber: (fiber: Fiber) => {
        // No-op.
    },

    /** Create the body function to be executed inside a fiber. */
    createFiberBody: (protocol: Protocol, getCo: () => CoroFiber) => {

        // V8 may not optimise the following function due to the presence of
        // try/catch/finally. Therefore it does as little as possible, only
        // referencing the optimisable closures prepared below.
        function fiberBody() {
            try { tryBlock(); }
            catch (err) { catchBlock(err); }
            finally { setImmediate(finallyBlock); /* Ensure the fiber exits before we clean it up. */ }
        }

        // These references are shared by the closures below.
        var co: CoroFiber, result, error;

        // Define the details of the body function's try/catch/finally clauses.
        function tryBlock() {

            // Lazy-load the coroutine instance to use throughout the body function. This mechanism
            // means that the instance need not be available at the time createFiberBody() is called.
            co = co || getCo();

            // Clear the error state.
            error = null;

            // Execute the entirety of bodyFunc, using the fastest feasible invocation approach.
            var f = co.bodyFunc, t = co.bodyThis, a = co.bodyArgs, noThis = !t || t === global;
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
            protocol.end(co, error, result);
            pipeline.releaseFiber(co);
            pipeline.releaseCoro(protocol, co);
        }

        // Return the completed fiberBody closure.
        return fiberBody;
    }
};
