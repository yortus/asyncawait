import references = require('references');
import Fiber = require('fibers');
import Semaphore = require('../semaphore');
export = Protocol;


class Protocol implements AsyncAwait.Protocol {

    invoke(func: Function, this_: any, args: any[]): any {
        this.semaphore = semaphore;
        this.func = () => func.apply(this_, args);
        return this;
    }

    resume() {
        if (!this.fiber) {

            // This fiber is starting now.
            var fiber = Fiber(() => this.fiberBody());
            fiber.yield = value => { this.yield(value); };
            this.fiber = fiber;

            //TODO: ...
            if (Fiber.current) return fiber.run();
            this.semaphore.enter(() => fiber.run());
        } else {

            // This fiber is resuming after a prior call to suspend().
            this.fiber.run();
        }
    }

    suspend() {
        Fiber.yield();
    }

    return(result: any) { }

    throw(error: any) { }

    yield(value: any) { }

    dispose() {
        this.fiber = null;
        this.func = null;
        this.semaphore.leave();
        this.semaphore = null;
    }

    /** Provides type info at compile-time only. */
    static SuspendableType: AsyncAwait.Suspendable;

    static arityFor(func: Function) {
        return func.length;
    }

    static maxConcurrency(n?: number) {
        if (arguments.length === 0) return maxConcurrency;
        maxConcurrency = n;
        semaphore = new Semaphore(n);
    }

    private fiberBody() {

        // NB: V8 may not optimise functions containing try/catch/finally,
        // so split the functionality into separate optimisable functions.
        try { this.try(); } catch (err) { this.catch(err); } finally { this.finally(); }
    }

    private try() {

        // Maintain an accurate count of currently active fibers, for pool management.
        adjustFiberCount(+1);

        var result = this.func();
        this.return(result);
    }

    private catch(err) {
        this.throw(err);
    }

    private finally() {
        // Maintain an accurate count of currently active fibers, for pool management.
        adjustFiberCount(-1);

        //TODO:... Fiber.poolSize mgmt, user hook(s)?
        this.dispose();
    }

    private fiber: Fiber;
    private func: Function;
    private semaphore: Semaphore;
}



//TODO:...
var maxConcurrency = 1000000;
var semaphore = new Semaphore(maxConcurrency);






/**
 * The following functionality prevents memory leaks in node-fibers by actively managing Fiber.poolSize.
 * For more information, see https://github.com/laverdet/node-fibers/issues/169.
 */
function adjustFiberCount(delta: number) {
    activeFiberCount += delta;
    if (activeFiberCount >= fiberPoolSize) {
        fiberPoolSize += 100;
        Fiber.poolSize = fiberPoolSize;
    }
}
var fiberPoolSize = Fiber.poolSize;
var activeFiberCount = 0;
