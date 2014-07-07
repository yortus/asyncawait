//TODO: rename to pipeline?
var assert = require('assert');
var Promise = require('bluebird');
var Fiber = require('fibers');
var _ = require('./util');
var semaphore = require('./semaphore');
var fiberPool = require('./fiberPool');


var system = {
    acquireCoro: acquireCoro,
    releaseCoro: releaseCoro,
    acquireFiber: acquireFiber,
    releaseFiber: releaseFiber
};

function acquireCoro(protocol, bodyFunc, bodyArgs, bodyThis) {
    var fiber = null;
    var co = {
        enter: function (error, value) {
            // On first entry
            if (!fiber) {
                assert(arguments.length === 0, 'enter: initial call must have no arguments');

                //TODO: shouldnt finally be run, and THEN return? or rename finally to something else, like 'cleanup/epilog/after/finalize/dtor'?
                //TODO: setImmediate? all, some? Was on finally, what now?
                var tryBlock = function () {
                    return protocol.return(co, bodyFunc.apply(bodyThis, bodyArgs));
                };
                var catchBlock = function (err) {
                    return protocol.throw(co, err);
                };
                var finallyBlock = function () {
                    protocol.finally(co);
                    setImmediate(function () {
                        // release fiber really async? Does this make sense release fiber -> <async> -> release co?
                        system.releaseFiber(fiber).then(function () {
                            system.releaseCoro(co);
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

                system.acquireFiber(fiberBody).then(function (f) {
                    fiber = f;
                    fiber.co = co;
                    fiber.yield = function (value) {
                        return protocol.yield(co, value);
                    };
                    fiber.run();
                });
            } else {
                // TODO: explain...
                if (error)
                    setImmediate(function () {
                        fiber.throwInto(error);
                    });
                else
                    setImmediate(function () {
                        fiber.run(value);
                    });
            }
        },
        leave: function (value) {
            //TODO: assert is current...
            Fiber.yield(value);
        }
    };
    return co;
}

function releaseCoro(co) {
    //TODO: no-op?
}

function acquireFiber(body) {
    return Promise.resolve(Fiber(body));
}

function releaseFiber(fiber) {
    fiber.co = null;
    fiber.yield = null;
    return Promise.resolve();
}

//TODO: temp testing...
function use(middleware) {
    var overrides = middleware(system);
    system = _.mergeProps({}, system, overrides);
}

var maxConcurrency = function (basePipeline) {
    return ({
        acquireFiber: function (body) {
            if (Fiber.current)
                return basePipeline.acquireFiber(body);
            return new Promise(function (resolve, reject) {
                semaphore.enter(function () {
                    basePipeline.acquireFiber(body).then(resolve, reject);
                });
            });
        },
        releaseFiber: function (fiber) {
            semaphore.leave(); //TODO: only if entered...
            return basePipeline.releaseFiber(fiber);
        }
    });
};

var fiberPoolBug = function (basePipeline) {
    return ({
        acquireFiber: function (body) {
            fiberPool.inc();
            return basePipeline.acquireFiber(body);
        },
        releaseFiber: function (fiber) {
            fiberPool.dec();
            return basePipeline.releaseFiber(fiber);
        }
    });
};

use(fiberPoolBug);
use(maxConcurrency);
module.exports = system;
//# sourceMappingURL=system.js.map
