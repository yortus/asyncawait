import references = require('references');
import Fiber = require('fibers');
import semaphore = require('../semaphore');
import fiberPool = require('../fiberPool');
export = Protocol;


class Protocol implements AsyncAwait.Protocol {

    invoke(...args): any {
        return this;
    }

    resume() {

        // Define a function to resume the fiber, lazily creating it on the initial call.
        var doResume = () => {
            if (!this._fiber) {
                fiberPool.inc();
                var fiber = Fiber(this.makeFiberBody());
                fiber.yield = value => { this.yield(value); };
                this._fiber = fiber;
            }
            this._fiber.run();
        }

        // Route all top-level initial resume()s through the global semaphore.
        var isTopLevelInitial = !this._fiber && !Fiber.current;
        if (isTopLevelInitial) semaphore.enter(doResume); else doResume();
    }

    suspend() {
        Fiber.yield();
    }

    return(result: any) { }

    throw(error: any) { }

    yield(value: any) { }

    dispose() {
        fiberPool.dec();
        this._fiber = null;
        this._func = null;
        semaphore.leave();
    }

    private makeFiberBody() {
        var tryBlock = () => this.return(this._func());
        var catchBlock = err => this.throw(err);
        var finallyBlock = () => this.dispose();

        // V8 may not optimise the following function due to the presence of
        // try/catch/finally. Therefore it does as little as possible, only
        // referencing the optimisable closures prepared above.
        return function fiberBody() {
            try { tryBlock(); }
            catch (err) { catchBlock(err); }
            finally { finallyBlock(); }
        };
    }

    private _fiber: Fiber;

    private _func: Function;
}
