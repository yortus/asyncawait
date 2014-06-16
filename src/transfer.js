var Fiber = require('fibers');
var semaphore = require('./semaphore');
var fiberPool = require('./fiberPool');


/** TODO: doc... */
var transfer;

// Transfer without value
transfer = function (coro) {
    if (coro) {
        // Transfer to the specified coroutine.
        //TODO:...
        //TODO PERF: only use semaphore if maxConcurrency is specified
        var isTopLevelInitial = !coro._fiber && !Fiber.current;
        if (isTopLevelInitial)
            return semaphore.enter(function () {
                return startOrResume(coro);
            });
        else
            startOrResume(coro);
    } else {
        // Yield from the current coroutine.
        return Fiber.yield();
    }
};

// Transfer with value
transfer.withValue = function (coro, value) {
    if (arguments.length > 1) {
        // Transfer to the specified coroutine.
        //TODO:...
        //TODO PERF: only use semaphore if maxConcurrency is specified
        var isTopLevelInitial = !coro._fiber && !Fiber.current;
        if (isTopLevelInitial)
            return semaphore.enter(function () {
                return startOrResume(coro);
            });
        else
            startOrResume(coro);
    } else {
        // Yield from the current coroutine.
        return Fiber.yield(coro);
    }
};

function startOrResume(coro) {
    if (!coro._fiber) {
        fiberPool.inc();
        var fiber = Fiber(makeFiberBody(coro));
        fiber.yield = function (value) {
            coro.yield(value);
        };
        coro._fiber = fiber;
    }
    coro._fiber.run();
}

function dispose(coro) {
    fiberPool.dec();
    coro._proc = null;
    coro._fiber = null;
    semaphore.leave();
}

function makeFiberBody(coro) {
    var tryBlock = function () {
        return coro.return(coro._proc());
    };
    var catchBlock = function (err) {
        return coro.throw(err);
    };
    var finallyBlock = function () {
        return dispose(coro);
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
module.exports = transfer;
//# sourceMappingURL=transfer.js.map
