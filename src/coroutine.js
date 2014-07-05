var assert = require('assert');
var Fiber = require('./fibers');
var semaphore = require('./semaphore');
var fiberPool = require('./fiberPool');


//TODO: ...
function create(protocol, body) {
    // Create the coroutine object, and a reference to hold the fiber associated with it.
    var co = {};
    var fiber = null;

    function startup() {
        //TODO PERF: only use semaphore if maxConcurrency is specified
        var isTopLevel = !Fiber.current;
        if (isTopLevel)
            return semaphore.enter(next);
        else
            next();

        function next() {
            fiberPool.inc(); //TODO: make this middleware
            fiber = createFiber(co, protocol, body, cleanup);
            setImmediate(function () {
                return fiber.run();
            }); //TODO: best place for setImmediate?
        }
    }
    function cleanup() {
        fiberPool.dec();
        fiber.co = null;
        fiber = null;
        semaphore.leave(); //TODO: make this middleware
    }

    // Tack on the enter(...) method.
    co.enter = function (error, value) {
        // On first entry
        if (!fiber) {
            assert(arguments.length === 0, 'enter: initial call must have no arguments');
            startup();
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
    };

    // Tack on the leave(...) method.
    co.leave = function (value) {
        //TODO: assert is current...
        Fiber.yield(value);
    };

    //========================================
    return co;
}

//TODO: ...
function createFiber(co, protocol, body, cleanup) {
    var fiber = Fiber(makeFiberBody());
    fiber.co = co;
    fiber.yield = function (value) {
        return protocol.yield(co, value);
    };
    return fiber;

    function makeFiberBody() {
        var tryBlock = function () {
            return protocol.return(co, body());
        };
        var catchBlock = function (err) {
            return protocol.throw(co, err);
        };
        var finallyBlock = function () {
            protocol.finally(co);
            setImmediate(cleanup);
        };

        // V8 may not optimise the following function due to the presence of
        // try/catch/finally. Therefore it does as little as possible, only
        // referencing the optimisable closures prepared above.
        return function fiberBody() {
            try  {
                tryBlock();
            } catch (err) {
                catchBlock(err);
            } finally {
                finallyBlock();
            }
        };
    }
}
module.exports = create;
//# sourceMappingURL=coroutine.js.map
