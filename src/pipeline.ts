import references = require('references');
import assert = require('assert');
import Promise = require('bluebird');
import Fiber = require('./fibers');
import _ = require('./util');
import Protocol = AsyncAwait.Async.Protocol;
import Coroutine = AsyncAwait.Coroutine;
export = pipeline;


//TODO: doc...
var pipeline = {
    acquireCoro: null,
    releaseCoro: null,
    acquireFiber: null,
    releaseFiber: null,


    //TODO: doc... private use stuff below...
    extensions: [],
    reset: () => {
        _.mergeProps(pipeline, defaultPipeline);
        pipeline.extensions = [];
        pipeline.isLocked = false;
    },
    isLocked: false
};


//TODO: doc...
var defaultPipeline = {

    acquireCoro: (protocol: Protocol, bodyFunc: Function, bodyArgs?: any[], bodyThis?: any) => {

        //TODO: doc...
        var fiber: Fiber = null;
        var co: Coroutine = {
            enter: (error?, value?) => {

                // On first entry
                if (!fiber) {
                    assert(arguments.length === 0, 'enter: initial call must have no arguments');

                    //TODO: shouldnt finally be run, and THEN return? or rename finally to something else, like 'cleanup/epilog/after/finalize/dtor'?
                    //TODO: setImmediate? all, some? Was on finally, what now?
                    var tryBlock = () => {
                        var result = bodyArgs || bodyThis ? bodyFunc.apply(bodyThis, bodyArgs) : bodyFunc();
                        protocol.return(co, result);
                    };
                    var catchBlock = err => protocol.throw(co, err);
                    var finallyBlock = () => {
                        protocol.finally(co);
                        setImmediate(() => {
                            // release fiber really async? Does this make sense release fiber -> <async> -> release co?
                            pipeline.releaseFiber(fiber).then(() => {
                                pipeline.releaseCoro(co);
                            });
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

                    pipeline.acquireFiber(fiberBody).then(f => {
                        fiber = f;
                        fiber.co = co;
                        fiber.yield = value => protocol.yield(co, value);
                        fiber.run();
                    });
                }
                else {
                    // TODO: explain...
                    if (error) setImmediate(() => { fiber.throwInto(error); });
                    else setImmediate(() => { fiber.run(value); });
                }
            },
            leave: (value?) => {
                //TODO: assert is current...
                Fiber.yield(value);
            }
        };
        return co;
    },


    //TODO: doc...
    releaseCoro: (co: Coroutine) => {
        //TODO: no-op?
    },


    //TODO: doc...
    acquireFiber: (body: () => any) => {
        return Promise.resolve(Fiber(body));
    },


    //TODO: doc...
    releaseFiber: (fiber: Fiber) => {
        fiber.co = null;
        fiber.yield = null;
        return Promise.resolve();
    }
}


//TODO: doc...
pipeline.reset();
