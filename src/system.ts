//TODO: rename to pipeline?



import references = require('references');
import assert = require('assert');
import Promise = require('bluebird');
import Fiber = require('fibers');
import _ = require('./util');
import semaphore = require('./semaphore');
import fiberPool = require('./fiberPool');
import Protocol = AsyncAwait.Async.Protocol;
import Coroutine = AsyncAwait.Coroutine;
import Pipeline = AsyncAwait.Pipeline;
import Middleware = AsyncAwait.Middleware;
export = system;


var system: Pipeline = {
    acquireCoro: acquireCoro,
    releaseCoro: releaseCoro,
    acquireFiber: acquireFiber,
    releaseFiber: releaseFiber
};


function acquireCoro(protocol: Protocol, bodyFunc: Function, bodyArgs?: any[], bodyThis?: any) {
    //TODO: implement optional arg handling...

    var fiber: Fiber = null;
    var co: Coroutine = {
        enter: (error?, value?) => {

            // On first entry
            if (!fiber) {
                assert(arguments.length === 0, 'enter: initial call must have no arguments');

                //TODO: shouldnt finally be run, and THEN return? or rename finally to something else, like 'cleanup/epilog/after/finalize/dtor'?
                //TODO: setImmediate? all, some? Was on finally, what now?
                var tryBlock = () => protocol.return(co, bodyFunc.apply(bodyThis, bodyArgs));
                var catchBlock = err => protocol.throw(co, err);
                var finallyBlock = () => {
                    protocol.finally(co);
                    setImmediate(() => {
                        // release fiber really async? Does this make sense release fiber -> <async> -> release co?
                        system.releaseFiber(fiber).then(() => {
                            system.releaseCoro(co);
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

                system.acquireFiber(fiberBody).then(f => {
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
}

function releaseCoro(co: Coroutine) {
    //TODO: no-op?
}

function acquireFiber(body: () => any) {
    return Promise.resolve(Fiber(body));
}

function releaseFiber(fiber: Fiber) {
    fiber.co = null;
    fiber.yield = null;
    return Promise.resolve();
}




//TODO: temp testing...
function use(middleware: Middleware): void {
    var overrides = middleware(system);
    system = _.mergeProps({}, system, overrides);
}




var maxConcurrency: Middleware = (basePipeline) => ({
    acquireFiber: body => {

        if (Fiber.current) return basePipeline.acquireFiber(body);
        return new Promise<Fiber>((resolve: any, reject) => {
            semaphore.enter(() => {
                basePipeline.acquireFiber(body).then(resolve, reject);
            });
        });
    },
    releaseFiber: fiber => {
        semaphore.leave(); //TODO: only if entered...
        return basePipeline.releaseFiber(fiber);
    }
});


var fiberPoolBug: Middleware = (basePipeline) => ({
    acquireFiber: body => {
        fiberPool.inc();
        return basePipeline.acquireFiber(body);
    },
    releaseFiber: fiber => {
        fiberPool.dec();
        return basePipeline.releaseFiber(fiber);
    }
});

use(fiberPoolBug);
use(maxConcurrency);




