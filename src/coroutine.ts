import references = require('references');
import assert = require('assert');
import Fiber = require('./fibers');
import semaphore = require('./semaphore');
import fiberPool = require('./fiberPool');
import Protocol = AsyncAwait.Async.Protocol;
import Coroutine = AsyncAwait.Coroutine;
export = create;


//TODO: ...
function create(protocol: Protocol, body: () => void): Coroutine {

    // Create the coroutine object, and a reference to hold the fiber associated with it.
    var co: Coroutine = <any> {};
    var fiber: Fiber = null;


    function startup() {

        //TODO PERF: only use semaphore if maxConcurrency is specified
        var isTopLevel = !Fiber.current;
        if (isTopLevel)
            return semaphore.enter(next);
        else
            next();


        function next() {
            fiberPool.inc();//TODO: make this middleware
            fiber = createFiber(co, protocol, body, cleanup);
            setImmediate(() => fiber.run()); //TODO: best place for setImmediate?
        }

    }
    function cleanup() {
        fiberPool.dec();
        fiber.co = null;
        fiber = null;
        semaphore.leave();//TODO: make this middleware
    }


    // Tack on the enter(...) method.
    co.enter = (error?, value?) => {

        // On first entry
        if (!fiber) {
            assert(arguments.length === 0, 'enter: initial call must have no arguments');
            startup();
        }
        else {
            // TODO: explain...
            if (error) setImmediate(() => { fiber.throwInto(error); });
            else setImmediate(() => { fiber.run(value); });
        }
    };


    // Tack on the leave(...) method.
    co.leave = (value?) => {
        //TODO: assert is current...
        Fiber.yield(value);
    };



    //========================================



    return co;
}


//TODO: ...
function createFiber(co: Coroutine, protocol: Protocol, body: () => void, cleanup: () => void) {

    var fiber = Fiber(makeFiberBody());
    fiber.co = co;
    fiber.yield = value => protocol.yield(co, value);
    return fiber;

    function makeFiberBody() {
        var tryBlock = () => protocol.return(co, body());
        var catchBlock = err => protocol.throw(co, err);
        var finallyBlock = () => { protocol.finally(co); setImmediate(cleanup); }

        // V8 may not optimise the following function due to the presence of
        // try/catch/finally. Therefore it does as little as possible, only
        // referencing the optimisable closures prepared above.
        return function fiberBody() {
            try { tryBlock(); }
            catch (err) { catchBlock(err); }
            finally { finallyBlock(); }
        };
    }
}
