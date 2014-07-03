var Fiber = require('./fibers');
var semaphore = require('./semaphore');
var fiberPool = require('./fiberPool');


/** TODO: doc... */
var transfer;

// Transfer without value
transfer = function (co) {
    if (co) {
        // Transfer to the specified coroutine.
        //TODO:...
        //TODO PERF: only use semaphore if maxConcurrency is specified
        var isTopLevelInitial = !co.fiber && !Fiber.current;
        if (isTopLevelInitial)
            return semaphore.enter(function () {
                return startOrResume(co);
            });
        else
            startOrResume(co);
    } else {
        // Yield from the current coroutine.
        return Fiber.yield();
    }
};

// Transfer with value
transfer.withValue = function (co, value) {
    if (arguments.length > 1) {
        // Transfer to the specified coroutine.
        //TODO:...
        //TODO PERF: only use semaphore if maxConcurrency is specified
        var isTopLevelInitial = !co.fiber && !Fiber.current;
        if (isTopLevelInitial)
            return semaphore.enter(function () {
                return startOrResume(co);
            });
        else
            startOrResume(co);
    } else {
        // Yield from the current coroutine.
        return Fiber.yield(co);
    }
};

//TODO: cleanup, optimise....
function startOrResume(co) {
    if (!co.fiber) {
        fiberPool.inc();
        var fiber = Fiber(makeFiberBody(co));
        fiber.yield = function (value) {
            return co.protocol.yield(co, value);
        }; //TODO: improve?
        co.fiber = fiber;
    }
    setImmediate(function () {
        return co.fiber.run();
    }); //TODO: best place for setImmediate?
}

function dispose(co) {
    fiberPool.dec();
    co.protocol = null;
    co.body = null;
    co.fiber = null;
    semaphore.leave();
}

function makeFiberBody(co) {
    var tryBlock = function () {
        return co.protocol.return(co, co.body());
    };
    var catchBlock = function (err) {
        return co.protocol.throw(co, err);
    };
    var finallyBlock = function () {
        co.protocol.finally(co);
        dispose(co);
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
            setImmediate(finallyBlock);
        }
    };
}
module.exports = transfer;
//# sourceMappingURL=transfer.js.map
