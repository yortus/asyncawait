var assert = require('assert');
var Fiber = require('fibers');
var _ = require('./util');


/**
*  A hash of functions and properties that are used internally at various
*  stages of async/await handling. The pipeline may be augmented by mods,
*  which are loaded via the use(...) API method.
*/
var pipeline = {
    // The following methods comprise the overridable part of the pipeline API.
    acquireCoro: null,
    releaseCoro: null,
    acquireFiber: null,
    releaseFiber: null,
    createFiberBody: null,
    // The remaining items are for internal use and may not be overriden.
    currentCoro: function () {
        return Fiber.current;
    },
    suspendCoro: function (val) {
        return Fiber.yield(val);
    },
    isCurrent: function (co) {
        var f = Fiber.current;
        return f && f.id === co.id;
    },
    nextCoroId: 1,
    continueAfterYield: {},
    notHandled: {},
    restoreDefaults: function () {
        return _.mergeProps(pipeline, defaultPipeline);
    },
    //TODO: temp testing... needed to move it to avoid circular ref cpsKeyword->cps->awaitBuilder->extensibility->cpsKeyword
    continuation: function continuation() {
        var co = pipeline.currentCoro();
        return function continue_(err, result) {
            co.enter(err, result);
            co = null;
        };
    }
};

/** Default implementations for the overrideable pipeline methods. */
var defaultPipeline = {
    /** Create and return a new Coroutine instance. */
    acquireCoro: function (protocol, bodyFunc, bodyThis, bodyArgs) {
        var fiberBody = pipeline.createFiberBody(protocol, function getCo() {
            return co;
        });
        var co = pipeline.acquireFiber(fiberBody);
        co.id = ++pipeline.nextCoroId;
        co.bodyFunc = bodyFunc;
        co.bodyThis = bodyThis;
        co.bodyArgs = bodyArgs;
        co.context = {};
        co.enter = function enter(error, value) {
            if (_.DEBUG)
                assert(!pipeline.isCurrent(co), 'enter: must not be called from the currently executing coroutine');
            if (error)
                co.throwInto(error);
            else
                co.run(value);
        };
        co.leave = function leave(value) {
            if (_.DEBUG)
                assert(pipeline.isCurrent(co), 'leave: may only be called from the currently executing coroutine');
            value = protocol.yield(co.context, value);
            if (value === pipeline.continueAfterYield)
                return;
            pipeline.suspendCoro(value);
        };
        return co;
    },
    /** Ensure the Coroutine instance is disposed of cleanly. */
    releaseCoro: function (protocol, co) {
        co.enter = null;
        co.leave = null;
        co.context = null;
        co.bodyFunc = null;
        co.bodyThis = null;
        co.bodyArgs = null;
    },
    /** Create and return a new Fiber instance. */
    acquireFiber: function (body) {
        return Fiber(body);
    },
    /** Ensure the Fiber instance is disposed of cleanly. */
    releaseFiber: function (fiber) {
        // No-op.
    },
    /** Create the body function to be executed inside a fiber. */
    createFiberBody: function (protocol, getCo) {
        // V8 may not optimise the following function due to the presence of
        // try/catch/finally. Therefore it does as little as possible, only
        // referencing the optimisable closures prepared below.
        function fiberBody() {
            try  {
                tryBlock();
            } catch (err) {
                catchBlock(err);
            } finally {
                setImmediate(finallyBlock); /* Ensure the fiber exits before we clean it up. */ 
            }
        }

        // These references are shared by the closures below.
        var co, result, error;

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
                    case 0:
                        result = f();
                        break;
                    case 1:
                        result = f(a[0]);
                        break;
                    case 2:
                        result = f(a[0], a[1]);
                        break;
                    default:
                        result = f.apply(null, a);
                }
            } else {
                result = !noThis ? f.apply(t, a) : f();
            }
        }
        function catchBlock(err) {
            error = err;
        }
        function finallyBlock() {
            if (error)
                protocol.throw(co.context, error);
            else
                protocol.return(co.context, result);
            pipeline.releaseFiber(co);
            pipeline.releaseCoro(protocol, co);
        }

        // Return the completed fiberBody closure.
        return fiberBody;
    }
};
module.exports = pipeline;
//# sourceMappingURL=pipeline.js.map
