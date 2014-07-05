//import references = require('references');
//import Fiber = require('./fibers');
//import semaphore = require('./semaphore');
//import fiberPool = require('./fiberPool');
//import Coroutine = AsyncAwait.Async.Coroutine;
//export = transfer;


///** TODO: doc... */
//var transfer: {
//    (): any;
//    (co: Coroutine): any;
//    //withValue: {
//    //    (value): any;
//    //    (co: Coroutine, value): any;
//    //}
//};


//// Transfer without value
//transfer = <any> function (co: Coroutine) {
//    if (co) {

//        // Transfer to the specified coroutine.
//        //TODO:...
//        //TODO PERF: only use semaphore if maxConcurrency is specified
//        var isTopLevelInitial = !co.fiber && !Fiber.current;
//        if (isTopLevelInitial) return semaphore.enter(() => startOrResume(co));
//        else startOrResume(co);




//    }
//    else {

//        // Yield from the current coroutine.
//        return Fiber.yield();
//    }
//};





////TODO: cleanup, optimise....
//function startOrResume(co) {
//    if (!co.fiber) {
//        fiberPool.inc();
//        var fiber = Fiber(makeFiberBody(co));
//        fiber.yield = value => co.protocol.yield(co, value); //TODO: improve?
//        co.fiber = fiber;
//    }
//    setImmediate(() => co.fiber.run()); //TODO: best place for setImmediate?
//}


//function dispose(co: Coroutine) {
//    fiberPool.dec();
//    co.protocol = null;
//    co.body = null;
//    co.fiber = null;
//    semaphore.leave();
//}

//function makeFiberBody(co: Coroutine) {
//    var tryBlock = () => co.protocol.return(co, co.body());
//    var catchBlock = err => co.protocol.throw(co, err);
//    var finallyBlock = () => { co.protocol.finally(co); dispose(co); }

//    // V8 may not optimise the following function due to the presence of
//    // try/catch/finally. Therefore it does as little as possible, only
//    // referencing the optimisable closures prepared above.
//    return function fiberBody() {
//        try { tryBlock(); }
//        catch (err) { catchBlock(err); }
//        finally { setImmediate(finallyBlock); }
//    };
//}
