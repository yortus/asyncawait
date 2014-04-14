import _refs = require('_refs');
import Fiber = require('fibers');
import Promise = require('bluebird');
import runInFiber = require('./runInFiber');
import RunContext = require('./runContext');
import CallbackArg = require('./callbackArg');
import ReturnValue = require('./returnValue');
import Semaphore = require('./semaphore');
import await = require('../await/index');
export = AsyncIterator;


/**
 * TODO: ...
 */
class AsyncIterator {

    /**
     * TODO: ...
     */
    constructor(private runContext: RunContext) {
        this.fiber = Fiber(runInFiber);
    }

    /**
     * TODO: ...
     */
    next() {

        // Configure the run context.
        if (this.runContext.options.callbackArg === CallbackArg.Required) {
            var callback = arguments[0];
            this.runContext.callback = callback;
        }
        if (this.runContext.options.returnValue === ReturnValue.Promise) {
            var resolver = Promise.defer<any>();
            this.runContext.resolver = resolver;
        }

        // Remove concurrency restrictions for nested calls, to avoid race conditions.
        var isTopLevel = !Fiber.current;
        if (!isTopLevel) this.runContext.semaphore = Semaphore.unlimited;

        // Run the fiber until it either yields a value or completes.
        this.runContext.semaphore.enter(() => this.fiber.run(this.runContext));

        // Return the appropriate value.
        return this.runContext.options.returnValue === ReturnValue.Promise ? resolver.promise : undefined;
    }

    /**
     * TODO: ...
     */
    forEach(callback: (value) => void) {
        if (this.runContext.options.returnValue === ReturnValue.Promise) {
            var doneResolver = Promise.defer<any>();
            var handler: any = (result) => {
                if (result.done) return doneResolver.resolve(null);
                callback(result.value);
                setImmediate(() => this.next().then(handler, err => doneResolver.reject(err)));
            }
            this.next().then(handler, err => doneResolver.reject(err));
            return doneResolver.promise;
        }
        if (this.runContext.options.callbackArg === CallbackArg.Required) {
            var doneCallback = arguments[1];
            var handler: any = (err, result) => {
                if (err) return doneCallback(err);
                if (result.done) return doneCallback();
                callback(result.value);
                setImmediate(this.next.bind(this), handler);
            }
            (<Function> this.next)(handler);
        }
    }

    private fiber: Fiber;
}
