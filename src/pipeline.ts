import references = require('references');
import assert = require('assert');
import Promise = require('bluebird');
import Fiber = require('fibers');
import _ = require('./util');
import Protocol = AsyncAwait.Async.Protocol;
import Coroutine = AsyncAwait.Coroutine;
export = pipeline;


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
    reset: <() => void> resetPipeline,
    isLocked: false
};


// Default implementations for the overrideable pipeline methods.
var defaultPipeline = {

    acquireCoro: (protocol: Protocol, bodyFunc: Function, bodyArgs?: any[], bodyThis?: any) => {

        //TODO: shouldnt finally be run, and THEN return? or rename finally to something else, like 'cleanup/epilog/after/finalize/dtor'?
        //TODO: setImmediate? all, some? Was on finally, what now?
        var tryBlock = () => {
            var result = bodyArgs || bodyThis ? bodyFunc.apply(bodyThis, bodyArgs) : bodyFunc();
            protocol.return(co.context, result);
        };
        var catchBlock = err => protocol.throw(co.context, err);
        var finallyBlock = () => {
            // TODO: if protocol supports explicit cleanup/dispose, it goes here...
            setImmediate(() => {
                pipeline.releaseFiber(fiber);
                pipeline.releaseCoro(co);
            });
        }

        // V8 may not optimise the following function due to the presence of
        // try/catch/finally. Therefore it does as little as possible, only
        // referencing the optimisable closures prepared above.
        function fiberBody() {
            try { tryBlock(); }
            catch (err) { catchBlock(err); }
            finally { finallyBlock(); }
        };

        // A coroutine is a fiber with additional properties
        var fiber = pipeline.acquireFiber(fiberBody);
        var co: Coroutine = fiber;
        fiber.co = co; //TODO: retire this, no longer needed...
        fiber.yield = value => { if (!protocol.yield(co.context, value)) co.leave(); };//TODO: review this. Use sentinel?


        co.enter = (error?, value?) => {
            if (error) setImmediate(() => { fiber.throwInto(error); });
            else setImmediate(() => { fiber.run(value); });
        };

        co.leave = (value?) => {
            assert(Fiber.current === fiber, 'leave: may only be called from the currently executing coroutine');
            Fiber.yield(value); // TODO: need setImmediate?
        };

        co.context = {};

        //TODO:...
        return co;
    },


    //TODO: doc...
    releaseCoro: (co: Coroutine) => {
        //TODO: no-op?
    },


    //TODO: doc...
    acquireFiber: (body: () => any) => {
        return Fiber(body);
    },


    //TODO: doc...
    releaseFiber: (fiber: Fiber) => {
        fiber.co = null;
        fiber.yield = null;
    }
}


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
