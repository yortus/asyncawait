var Promise = require('bluebird');

var await = require('../await/index');

/**
* TODO: ...
*/
var PromiseIterator = (function () {
    /**
    * TODO: ...
    */
    function PromiseIterator(fiber, runContext) {
        this.fiber = fiber;
        this.runContext = runContext;
    }
    /**
    * TODO: ...
    */
    PromiseIterator.prototype.next = function () {
        var value = Promise.defer();
        var done = Promise.defer();
        this.runContext.value = value;
        this.runContext.done = done;

        // Run the fiber until it either yields a value or completes
        this.fiber.run(this.runContext);

        return { value: value.promise, done: done.promise };
    };

    /**
    * TODO: ...
    */
    PromiseIterator.prototype.forEach = function (callback) {
        while (true) {
            var i = this.next();
            if (await(i.done)) {
                this.fiber = null;
                this.runContext = null;
                break;
            }
            callback(await(i.value));
        }
    };
    return PromiseIterator;
})();
module.exports = PromiseIterator;
//# sourceMappingURL=promiseIterator.js.map
