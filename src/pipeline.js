var assert = require('assert');
var Promise = require('bluebird');
var Fiber = require('./fibers');
var _ = require('./util');


//TODO: doc...
var pipeline = {
    acquireCoro: null,
    releaseCoro: null,
    acquireFiber: null,
    releaseFiber: null,
    //TODO: doc... private use stuff below...
    extensions: [],
    reset: function () {
        _.mergeProps(pipeline, defaultPipeline);
        pipeline.extensions = [];
        pipeline.isLocked = false;
    },
    isLocked: false
};

//TODO: doc...
var defaultPipeline = {
    acquireCoro: function (protocol, bodyFunc, bodyArgs, bodyThis) {
        //TODO: doc...
        var fiber = null;
        var co = {
            enter: function (error, value) {
                // On first entry
                if (!fiber) {
                    assert(arguments.length === 0, 'enter: initial call must have no arguments');

                    //TODO: shouldnt finally be run, and THEN return? or rename finally to something else, like 'cleanup/epilog/after/finalize/dtor'?
                    //TODO: setImmediate? all, some? Was on finally, what now?
                    var tryBlock = function () {
                        var result = bodyArgs || bodyThis ? bodyFunc.apply(bodyThis, bodyArgs) : bodyFunc();
                        protocol.return(co, result);
                    };
                    var catchBlock = function (err) {
                        return protocol.throw(co, err);
                    };
                    var finallyBlock = function () {
                        protocol.finally(co);
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

//TODO: doc...
pipeline.reset();
module.exports = pipeline;
//# sourceMappingURL=pipeline.js.map
