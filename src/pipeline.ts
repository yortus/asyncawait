import references = require('references');
import assert = require('assert');
import Promise = require('bluebird');
import Fiber = require('fibers');
import _ = require('./util');
import Pipeline = AsyncAwait.Pipeline;
import Coroutine = AsyncAwait.Coroutine;
import Protocol = AsyncAwait.Async.Protocol;
export = pipeline;


// Default implementations for the overrideable pipeline methods.
var defaultPipeline: Pipeline = {

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
                pipeline.releaseFiber(co);
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
        var co = pipeline.acquireFiber(fiberBody);
        co.enter = (error?, value?) => {
            if (error) setImmediate(() => { co.throwInto(error); });
            else setImmediate(() => { co.run(value); });
        };
        co.leave = (value?) => {
            var current = pipeline.currentCoro();
            assert(current && current.context === co.context, 'leave: may only be called from the currently executing coroutine');

            var continueExecution = protocol.yield(co.context, value);
            if (!continueExecution) pipeline.suspendCoro(value); // TODO: need setImmediate?
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
    }
}


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
    currentCoro: () => Fiber.current,
    suspendCoro: (val?) => Fiber.yield(val),
    mods: [],
    reset: <() => void> resetPipeline,
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
