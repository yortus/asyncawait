var assert = require('assert');
var Promise = require('bluebird');
var Fiber = require('fibers');
var _ = require('./util');


/**
*  A hash of functions that are used internally by asyncawait at various stages
*  of handling asynchronous functions. These can be augmented with the use(...)
*  method on asyncawait's primary export.
*/
var pipeline = {
    // The following four methods comprise the overridable pipeline API.
    acquireCoro: null,
    releaseCoro: null,
    acquireFiber: null,
    releaseFiber: null,
    // The remaining items are for internal use and must not be overriden.
    mods: [],
    reset: resetPipeline,
    isLocked: false
};

// Default implementations for the overrideable pipeline methods.
var defaultPipeline = {
    acquireCoro: function (protocol, bodyFunc, bodyArgs, bodyThis) {
        // Declare references to the coro and its fiber, which the enter() and leave() methods below close over.
        var fiber = null;
        var co = {
            enter: function (error, value) {
                // If this coro is already up and running, simply resume (or throw into) it.
                if (fiber) {
                    if (error)
                        setImmediate(function () {
                            fiber.throwInto(error);
                        });
                    else
                        setImmediate(function () {
                            fiber.run(value);
                        });
                    return;
                }

                // The fiber hasn't been created yet, so this must be the first enter() call for this coro.
                // Ensure the first call passes no arguments. This is an internal sanity check.
                assert(arguments.length === 0, 'enter: initial call must have no arguments');

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
                        // release fiber really async? Does this make sense release fiber -> <async> -> release co?
                        pipeline.releaseFiber(fiber).then(function () {
                            pipeline.releaseCoro(co);
                        });
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

                pipeline.acquireFiber(fiberBody).then(function (f) {
                    fiber = f;
                    fiber.co = co;
                    fiber.yield = function (value) {
                        if (!protocol.yield(co.context, value))
                            co.leave();
                    }; //TODO: review this. Use sentinel?
                    fiber.run();
                });
            },
            leave: function (value) {
                //TODO: assert is current...
                Fiber.yield(value); // TODO: need setImmediate?
            },
            context: {}
        };

        //TODO:...
        return co;
    },
    //TODO: doc...
    releaseCoro: function (co) {
        //TODO: no-op?
    },
    //TODO: doc...
    acquireFiber: function (body) {
        return Promise.resolve(Fiber(body));
    },
    //TODO: doc...
    releaseFiber: function (fiber) {
        fiber.co = null;
        fiber.yield = null;
        return Promise.resolve();
    }
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
