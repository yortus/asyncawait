var assert = require('assert');

var Promise = require('bluebird');
var _ = require('lodash');
var FiberMgr = require('./fiberManager');

var Semaphore = require('./semaphore');

/**
* Asynchronous analogue to an ES6 Iterator. Rather than return each value/done
* result synchronously, the next() function notifies a promise and/or callback
* when the next result is ready.
*/
var AsyncIterator = (function () {
    /** Construct a new AsyncIterator instance. This will create a fiber. */
    function AsyncIterator(runContext, semaphore) {
        this._runContext = runContext;
        this._semaphore = semaphore;
        this._fiber = FiberMgr.create();
    }
    /** Fetch the next result from the iterator. */
    AsyncIterator.prototype.next = function (callback) {
        var _this = this;
        // Configure the run context.
        if (this._runContext.callback) {
            assert(_.isFunction(callback), 'AsyncIterator#next() expected a callback function');
            this._runContext.callback = callback;
        }
        if (this._runContext.resolver) {
            var resolver = Promise.defer();
            this._runContext.resolver = resolver;
        }

        // Remove concurrency restrictions for nested calls, to avoid race conditions.
        if (FiberMgr.isExecutingInFiber())
            this._semaphore = Semaphore.unlimited;

        // Run the fiber until it either yields a value or completes.
        this._semaphore.enter(function () {
            return _this._fiber.run(_this._runContext);
        });
        this._runContext.done = function () {
            return _this._semaphore.leave();
        };

        // Return the appropriate value.
        return this._runContext.resolver ? resolver.promise : undefined;
    };

    /** Enumerate the entire iterator, calling callback with each result. */
    AsyncIterator.prototype.forEach = function (callback, doneCallback) {
        var _this = this;
        // Asynchronously call next() repeatedly until done.
        if (this._runContext.callback) {
            var handler = function (err, result) {
                if (err || result.done)
                    return done(err);
                callback(result.value);
                setImmediate(_this.next.bind(_this), handler);
            };
            this.next(handler);
        } else if (this._runContext.resolver) {
            var handler = function (result) {
                if (result.done)
                    return done();
                callback(result.value);
                setImmediate(function () {
                    return _this.next().then(handler, done);
                });
            };
            this.next().then(handler, done);
        }

        // Synchronously return the appropriate value.
        var doneResolver = this._runContext.resolver ? Promise.defer() : null;
        return doneResolver ? doneResolver.promise : undefined;

        // This function notifies waiters when the iteration finishes or fails.
        function done(err) {
            if (doneResolver)
                doneResolver.resolve(err);
            if (doneCallback)
                doneCallback(err);
        }
    };

    /** Release resources associated with this instance (i.e., the fiber). */
    AsyncIterator.prototype.destroy = function () {
        this._fiber = null;
    };
    return AsyncIterator;
})();
module.exports = AsyncIterator;
//# sourceMappingURL=asyncIterator.js.map
