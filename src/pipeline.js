var assert = require('assert');
var Fiber = require('fibers');
var _ = require('./util');


//TODO: temp testing...
var coroPool = [];

// Default implementations for the overrideable pipeline methods.
var defaultPipeline = {
    /** Create and return a new Coroutine instance. */
    acquireCoro: function (protocol, bodyFunc, bodyThis, bodyArgs) {
        //TODO: temp testing...
        var p = protocol;
        if (!p.coroPool)
            p.coroPool = [];
        if (p.coroPool.length > 0) {
            var co = p.coroPool.pop();
            co.bodyFunc = bodyFunc;
            co.bodyThis = bodyThis;
            co.bodyArgs = bodyArgs;
            co.context = {};
            return co;
        }

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
        //TODO: temp testing...
        var p = protocol;
        p.coroPool.push(co);
        return;

        //TODO: was...
        //TODO: add body stuff...
        co.enter = null;
        co.leave = null;
        co.context = null;
    },
    /** Create and return a new Fiber instance. */
    acquireFiber: function (body) {
        return Fiber(body);
    },
    /** Ensure the Fiber instance is disposed of cleanly. */
    releaseFiber: function (fiber) {
        // NB: Nothing to do here in this default implementation.
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
        ;

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
                    case 3:
                        result = f(a[0], a[1], a[2]);
                        break;
                    case 4:
                        result = f(a[0], a[1], a[2], a[3]);
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
        ;
        function finallyBlock() {
            if (error)
                protocol.throw(co.context, error);
            else
                protocol.return(co.context, result);
            pipeline.releaseFiber(co);
            pipeline.releaseCoro(protocol, co);
        }
        ;

        // Return the completed fiberBody closure.
        return fiberBody;
    }
};

/**
*  A hash of functions and properties that are used internally by asyncawait at
*  various stages of handling asynchronous functions. These can be augmented with
*  the use(...) method on asyncawait's primary export.
*/
var pipeline = {
    // The following methods comprise the overridable pipeline API.
    acquireCoro: defaultPipeline.acquireCoro,
    releaseCoro: defaultPipeline.releaseCoro,
    acquireFiber: defaultPipeline.acquireFiber,
    releaseFiber: defaultPipeline.releaseFiber,
    createFiberBody: defaultPipeline.createFiberBody,
    // The remaining items are for internal use and must not be overriden.
    currentCoro: function () {
        return Fiber.current;
    },
    suspendCoro: function (val) {
        return Fiber.yield(val);
    },
    isCurrent: isCurrentCoro,
    nextCoroId: 1,
    continueAfterYield: {},
    notHandled: {},
    reset: resetPipeline,
    isLocked: false,
    mods: []
};

/** Reset the pipeline to its default state. This is useful for unit testing. */
function resetPipeline() {
    // Restore the methods from the default pipeline.
    _.mergeProps(pipeline, defaultPipeline);

    // 'Forget' all applied mods.
    pipeline.mods = [];

    // Unlock the pipeline so that use(...) calls can be made again.
    pipeline.isLocked = false;
}

function isCurrentCoro(co) {
    var current = Fiber.current;
    return current && current.id === co.id;
}
module.exports = pipeline;
//# sourceMappingURL=pipeline.js.map
