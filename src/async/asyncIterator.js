var Fiber = require('fibers');
var Promise = require('bluebird');
var runInFiber = require('./runInFiber');

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
        this._fiber = Fiber(runInFiber);
    }
    /** Fetch the next result from the iterator. */
    AsyncIterator.prototype.next = function () {
        var _this = this;
        // Configure the run context.
        if (this._runContext.callback) {
            var callback = arguments[0];
            this._runContext.callback = callback;
        }
        if (this._runContext.resolver) {
            var resolver = Promise.defer();
            this._runContext.resolver = resolver;
        }

        // Remove concurrency restrictions for nested calls, to avoid race conditions.
        var isTopLevel = !Fiber.current;
        if (!isTopLevel)
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
    AsyncIterator.prototype.forEach = function (callback) {
        var _this = this;
        if (this._runContext.resolver) {
            var doneResolver = Promise.defer();
            var handler = function (result) {
                if (result.done)
                    return doneResolver.resolve(null);
                callback(result.value);
                setImmediate(function () {
                    return _this.next().then(handler, function (err) {
                        return doneResolver.reject(err);
                    });
                });
            };
            this.next().then(handler, function (err) {
                return doneResolver.reject(err);
            });
            return doneResolver.promise;
        }
        if (this._runContext.callback) {
            var doneCallback = arguments[1];
            var handler = function (err, result) {
                if (err)
                    return doneCallback(err);
                if (result.done)
                    return doneCallback();
                callback(result.value);
                setImmediate(_this.next.bind(_this), handler);
            };
            this.next(handler);
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
