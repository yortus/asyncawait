var assert = require('assert');
var Fiber = require('fibers');
var _ = require('./util');


//TODO: temp testing...
var coroPool = [];

// Default implementations for the overrideable pipeline methods.
var defaultPipeline = {
    /** Create and return a new Coroutine instance. */
    acquireCoro: function (protocol, bodyFunc, bodyArgs, bodyThis) {
        //TODO: temp testing...
        var p = protocol;
        if (!p.coroPool)
            p.coroPool = [];
        if (p.coroPool.length > 0) {
            var co = p.coroPool.pop();
            co.bodyFunc = bodyFunc;
            co.bodyArgs = bodyArgs;
            co.bodyThis = bodyThis;
            co.context = {};
            return co;
        }

        var fiberBody = pipeline.createFiberBody(protocol, function () {
            return co;
        });
        var co = pipeline.acquireFiber(fiberBody);
        co.protocol = protocol;
        co.bodyFunc = bodyFunc;
        co.bodyArgs = bodyArgs;
        co.bodyThis = bodyThis;
        co.context = {};
        co.enter = function enter(error, value) {
            if (_.DEBUG)
                assert(!pipeline.isCurrent(co), 'enter: must not be called from the currently executing coroutine');
            if (error)
                process.nextTick(function () {
                    co.throwInto(error);
                });
            else
                process.nextTick(function () {
                    co.run(value);
                });
        };
        co.leave = function leave(value) {
            if (_.DEBUG)
                assert(pipeline.isCurrent(co), 'enter: may only be called from the currently executing coroutine');
            value = protocol.yield(co.context, value);
            if (value === pipeline.continueAfterYield)
                return;
            pipeline.suspendCoro(value);
        };
        return co;
    },
    /** Ensure the Coroutine instance is disposed of cleanly. */
    releaseCoro: function (co) {
        //TODO: temp testing...
        var p = co.protocol;
        p.coroPool.push(co);
        return;

        //TODO: was...
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
                finallyBlock();
            }
        }
        ;

        // Shared reference to coroutine, which is only available after getCo() is called.
        var co, result_, return_, finally_;

        // Define the details of the body function's try/catch/finally clauses.
        var tryBlock = function () {
            // Lazy-load the coroutine instance to use throughout the body function. This mechanism
            // means that the instance need not be available at the time createFiberBody() is called.
            if (!co) {
                co = getCo();
                return_ = function () {
                    return protocol.return(co.context, result_);
                };
                finally_ = function () {
                    pipeline.releaseFiber(co);
                    pipeline.releaseCoro(co);
                };
            }

            // Execute the entirety of bodyFunc, then perform the protocol-specific return operation.
            var slowCall = (co.bodyArgs && co.bodyArgs.length) || (co.bodyThis && co.bodyThis !== global);
            result_ = slowCall ? co.bodyFunc.apply(co.bodyThis, co.bodyArgs) : co.bodyFunc();
            setImmediate(return_);
        };
        var catchBlock = function (err) {
            // Handle exceptions in a protocol-defined manner.
            setImmediate(function () {
                return protocol.throw(co.context, err);
            });
        };
        var finallyBlock = function () {
            // Ensure the fiber exits before we clean it up.
            setImmediate(finally_);
        };

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
    return current && current.context === co.context;
}
module.exports = pipeline;
//# sourceMappingURL=pipeline.js.map
