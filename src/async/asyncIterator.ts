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
 * Asynchronous analogue to an ES6 Iterator. Rather than return each value/done
 * result synchronously, the next() function notifies a promise and/or callback
 * when the next result is ready.
 */
class AsyncIterator {

    /** Construct a new AsyncIterator instance. This will create a fiber. */
    constructor(runContext: RunContext, semaphore: Semaphore) {
        this._runContext = runContext;
        this._semaphore = semaphore;
        this._fiber = Fiber(runInFiber);
    }

    /** Fetch the next result from the iterator. */
    next() {

        // Configure the run context.
        if (this._runContext.callback) {
            var callback = arguments[0];//TODO: assert is function
            this._runContext.callback = callback;
        }
        if (this._runContext.resolver) {
            var resolver = Promise.defer<any>();
            this._runContext.resolver = resolver;
        }

        // Remove concurrency restrictions for nested calls, to avoid race conditions.
        var isTopLevel = !Fiber.current;
        if (!isTopLevel) this._semaphore = Semaphore.unlimited;

        // Run the fiber until it either yields a value or completes.
        this._semaphore.enter(() => this._fiber.run(this._runContext));
        this._runContext.done = () => this._semaphore.leave();

        // Return the appropriate value.
        return this._runContext.resolver ? resolver.promise : undefined;
    }

    /** Enumerate the entire iterator, calling callback with each result. */
    forEach(callback: (value) => void) {
        if (this._runContext.resolver) {
            var doneResolver = Promise.defer<any>();
            var handler: any = (result) => {
                if (result.done) return doneResolver.resolve(null);
                callback(result.value);
                setImmediate(() => this.next().then(handler, err => doneResolver.reject(err)));
            }
            this.next().then(handler, err => doneResolver.reject(err));
            return doneResolver.promise;
        }
        if (this._runContext.callback) {
            var doneCallback = arguments[1];//TODO: assert is function
            var handler: any = (err, result) => {
                if (err) return doneCallback(err);
                if (result.done) return doneCallback();
                callback(result.value);
                setImmediate(this.next.bind(this), handler);
            }
            (<Function> this.next)(handler);
        }
    }

    /** Release resources associated with this instance (i.e., the fiber). */
    destroy() {
        this._fiber = null;
    }

    private _runContext: RunContext;
    private _semaphore: Semaphore;
    private _fiber: Fiber;
}
