var Fiber = require('fibers');
var Promise = require('bluebird');
var runInFiber = require('./runInFiber');

var Semaphore = require('./semaphore');


/**
* TODO: ...
*/
var AsyncIterator = (function () {
    /**
    * TODO: ...
    */
    function AsyncIterator(runContext) {
        this.runContext = runContext;
        this.fiber = Fiber(runInFiber);
    }
    /**
    * TODO: ...
    */
    AsyncIterator.prototype.next = function () {
        var _this = this;
        // Configure the run context.
        if (this.runContext.callback) {
            var callback = arguments[0];
            this.runContext.callback = callback;
        }
        if (this.runContext.resolver) {
            var resolver = Promise.defer();
            this.runContext.resolver = resolver;
        }

        // Remove concurrency restrictions for nested calls, to avoid race conditions.
        var isTopLevel = !Fiber.current;
        if (!isTopLevel)
            this.runContext.semaphore = Semaphore.unlimited;

        // Run the fiber until it either yields a value or completes.
        this.runContext.semaphore.enter(function () {
            return _this.fiber.run(_this.runContext);
        });

        // Return the appropriate value.
        return this.runContext.resolver ? resolver.promise : undefined;
    };

    /**
    * TODO: ...
    */
    AsyncIterator.prototype.forEach = function (callback) {
        var _this = this;
        if (this.runContext.resolver) {
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
        if (this.runContext.callback) {
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
    return AsyncIterator;
})();
module.exports = AsyncIterator;
//# sourceMappingURL=asyncIterator.js.map
