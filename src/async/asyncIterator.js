var Fiber = require('fibers');
var Promise = require('bluebird');
var runInFiber = require('./runInFiber');

var CallbackArg = require('./callbackArg');
var ReturnValue = require('./returnValue');
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
        if (this.runContext.options.callbackArg === 1 /* Required */) {
            var callback = arguments[0];
            this.runContext.callback = callback;
        }
        if (this.runContext.options.returnValue === 1 /* Promise */) {
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
        return this.runContext.options.returnValue === 1 /* Promise */ ? resolver.promise : undefined;
    };

    /**
    * TODO: ...
    */
    AsyncIterator.prototype.forEach = function (callback) {
        var _this = this;
        if (this.runContext.options.returnValue === 1 /* Promise */) {
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
        if (this.runContext.options.callbackArg === 1 /* Required */) {
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
