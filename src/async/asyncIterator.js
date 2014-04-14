var Promise = require('bluebird');

var CallbackArg = require('./callbackArg');
var ReturnValue = require('./returnValue');
var await = require('../await/index');

/**
* TODO: ...
*/
var AsyncIterator = (function () {
    /**
    * TODO: ...
    */
    function AsyncIterator(fiber, runContext) {
        this.fiber = fiber;
        this.runContext = runContext;
    }
    /**
    * TODO: ...
    */
    AsyncIterator.prototype.next = function () {
        if (this.runContext.options.callbackArg === 1 /* Required */) {
            var callback = arguments[0];
            this.runContext.callback = callback;
        }
        if (this.runContext.options.returnValue === 1 /* Promise */) {
            var resolver = Promise.defer();
            this.runContext.resolver = resolver;
        }

        // Run the fiber until it either yields a value or completes.
        this.fiber.run(this.runContext);

        // Return the appropriate value.
        return this.runContext.options.returnValue === 1 /* Promise */ ? resolver.promise : undefined;
    };

    /**
    * TODO: ...
    */
    AsyncIterator.prototype.forEach = function (callback) {
        while (true) {
            var i = await(this.next());
            if (i.done)
                break;
            callback(i.value);
        }
    };
    return AsyncIterator;
})();
module.exports = AsyncIterator;
//# sourceMappingURL=asyncIterator.js.map
