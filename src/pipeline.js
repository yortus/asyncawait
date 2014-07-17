var assert = require('assert');

var Fiber = require('fibers');
var _ = require('./util');


// Default implementations for the overrideable pipeline methods.
var defaultPipeline = {
    acquireCoro: function (protocol, bodyFunc, bodyArgs, bodyThis) {
        //TODO: shouldnt finally be run, and THEN return? or rename finally to something else, like 'cleanup/epilog/after/finalize/dtor'?
        //TODO: setImmediate? all, some? Was on finally, what now?
        var tryBlock = function () {
            var result = bodyArgs || bodyThis ? bodyFunc.apply(bodyThis, bodyArgs) : bodyFunc();
            protocol.return(co.context, result);
        };
        var catchBlock = function (err) {
            return protocol.throw(co.context, err);
        };
        var finallyBlock = function () {
            // TODO: if protocol supports explicit cleanup/dispose, it goes here...
            setImmediate(function () {
                pipeline.releaseFiber(co);
                pipeline.releaseCoro(co);
            });
        };

        // V8 may not optimise the following function due to the presence of
        // try/catch/finally. Therefore it does as little as possible, only
        // referencing the optimisable closures prepared above.
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

        // A coroutine is a fiber with additional properties
        var co = pipeline.acquireFiber(fiberBody);

        //TODO: needed now that fi and co are now one and the same object?
        co.yield = function (value) {
            //TODO: temp testing...
            assert(Fiber.current && Fiber.current.context === co.context, 'yield: may only be called from the currently executing coroutine');

            if (!protocol.yield(co.context, value))
                co.leave();
        }; //TODO: review this. Use sentinel?

        co.enter = function (error, value) {
            if (error)
                setImmediate(function () {
                    co.throwInto(error);
                });
            else
                setImmediate(function () {
                    co.run(value);
                });
        };

        co.leave = function (value) {
            assert(Fiber.current && Fiber.current.context === co.context, 'leave: may only be called from the currently executing coroutine');
            Fiber.yield(value); // TODO: need setImmediate?
        };

        co.context = {};

        //TODO:...
        return co;
    },
    //TODO: doc...
    releaseCoro: function (co) {
        //TODO: no-op?
    },
    //TODO: doc...
    acquireFiber: function (body) {
        return Fiber(body);
    },
    //TODO: doc...
    releaseFiber: function (fiber) {
        //fiber.co = null;
        fiber.yield = null;
    }
};

/**
*  A hash of functions that are used internally by asyncawait at various stages
*  of handling asynchronous functions. These can be augmented with the use(...)
*  method on asyncawait's primary export.
*/
var pipeline = {
    // The following four methods comprise the overridable pipeline API.
    acquireCoro: defaultPipeline.acquireCoro,
    releaseCoro: defaultPipeline.releaseCoro,
    acquireFiber: defaultPipeline.acquireFiber,
    releaseFiber: defaultPipeline.releaseFiber,
    // The remaining items are for internal use and must not be overriden.
    mods: [],
    reset: resetPipeline,
    isLocked: false
};

function resetPipeline() {
    // Restore the methods from the default pipeline.
    _.mergeProps(pipeline, defaultPipeline);

    // 'Forget' all applied mods.
    pipeline.mods = [];

    // Unlock the pipeline so that use(...) calls can be made again.
    pipeline.isLocked = false;
}

//TODO: doc...
pipeline.reset();
module.exports = pipeline;
//# sourceMappingURL=pipeline.js.map
