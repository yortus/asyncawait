import references = require('references');
import Fiber = require('fibers');
import semaphore = require('./semaphore');
import fiberPool = require('./fiberPool');
import Coroutine = require('./coroCtors/base');
export = transfer;


/** TODO: doc... */
var transfer: {
    (): any;
    (coro: Coroutine): any;
    withValue: {
        (value: any): any;
        (coro: Coroutine, value: any): any;
    }
};


// Transfer without value
transfer = <any> function (coro: Coroutine) {
    if (coro) {

        // Transfer to the specified coroutine.
        //TODO:...
        //TODO PERF: only use semaphore if maxConcurrency is specified
        var isTopLevelInitial = !coro._fiber && !Fiber.current;
        if (isTopLevelInitial) return semaphore.enter(() => startOrResume(coro));
        else startOrResume(coro);




    }
    else {

        // Yield from the current coroutine.
        return Fiber.yield();
    }
};


// Transfer with value
transfer.withValue = <any> function (coro: Coroutine, value: any) {
    if (arguments.length > 1) {

        // Transfer to the specified coroutine.
        //TODO:...
        //TODO PERF: only use semaphore if maxConcurrency is specified
        var isTopLevelInitial = !coro._fiber && !Fiber.current;
        if (isTopLevelInitial) return semaphore.enter(() => startOrResume(coro));
        else startOrResume(coro);



    }
    else {

        // Yield from the current coroutine.
        return Fiber.yield(coro); // coro actually holds the value to yield
    }
};






function startOrResume(coro: Coroutine) {
    if (!coro._fiber) {
        fiberPool.inc();
        var fiber = Fiber(makeFiberBody(coro));
        fiber.yield = value => { coro.yield(value); };
        coro._fiber = fiber;
    }
    coro._fiber.run();
}


function dispose(coro: Coroutine) {
    fiberPool.dec();
    coro._proc = null;
    coro._fiber = null;
    semaphore.leave();
}

function makeFiberBody(coro: Coroutine) {
    var tryBlock = () => coro.return(coro._proc());
    var catchBlock = err => coro.throw(err);
    var finallyBlock = () => dispose(coro);

    // V8 may not optimise the following function due to the presence of
    // try/catch/finally. Therefore it does as little as possible, only
    // referencing the optimisable closures prepared above.
    return function fiberBody() {
        try { tryBlock(); }
        catch (err) { catchBlock(err); }
        finally { finallyBlock(); }
    };
}



