import _refs = require('_refs');
import Fiber = require('fibers');
import Promise = require('bluebird');
import _ = require('lodash');
import FiberMgr = require('./fiberManager');
import RunContext = require('./runContext');
import Semaphore = require('./semaphore');
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
        this._fiber = FiberMgr.create();
        this._acceptsCallback = !!runContext.callback;
    }

    /** Fetch the next result from the iterator. */
    next(callback?: (err, result) => void) {

        // Configure the run context.
        if (this._acceptsCallback) {
            this._runContext.callback = callback; // May be null, in which case it won't be used.
        }
        if (this._runContext.resolver) {
            var resolver = Promise.defer<any>();
            this._runContext.resolver = resolver;
        }

        // Remove concurrency restrictions for nested calls, to avoid race conditions.
        if (FiberMgr.isExecutingInFiber()) this._semaphore = Semaphore.unlimited;

        // Run the fiber until it either yields a value or completes.
        this._semaphore.enter(() => this._fiber.run(this._runContext));
        this._runContext.done = () => this._semaphore.leave();

        // Return the appropriate value.
        return this._runContext.resolver ? resolver.promise : undefined;
    }

    /** Enumerate the entire iterator, calling callback with each result. */
    forEach(callback: (value) => void, doneCallback?: (err?) => void) {

        // Asynchronously call next() repeatedly until done.
        if (this._acceptsCallback) {
            var handler: any = (err, result) => {
                if (err || result.done) return done(err);
                callback(result.value);
                setImmediate(this.next.bind(this), handler);
            }
            this.next(handler);
        } else if (this._runContext.resolver) {
            var handler: any = (result) => {
                if (result.done) return done();
                callback(result.value);
                setImmediate(() => this.next().then(handler, done));
            }
            this.next().then(handler, done);
        }

        // Synchronously return the appropriate value.
        var doneResolver = this._runContext.resolver ? Promise.defer<any>() : null;
        return doneResolver ? doneResolver.promise : undefined;
        if (!this._acceptsCallback) doneCallback = null;

        // This function notifies waiters when the iteration finishes or fails.
        function done(err?) {
            if (doneResolver) doneResolver.resolve(err);
            if (doneCallback) doneCallback(err);
        }
    }

    /** Release resources associated with this object (i.e., the fiber). */
    destroy() {
        this._fiber = null;
    }

    private _runContext: RunContext;
    private _semaphore: Semaphore;
    private _fiber: Fiber;
    private _acceptsCallback: boolean;
}
