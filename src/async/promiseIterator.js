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
        var nextValue = Promise.defer();
        this.runContext.value = nextValue;

        // Run the fiber until it either yields a value or completes
        this.fiber.run(this.runContext);

        return nextValue.promise;
    };

    /**
    * TODO: ...
    */
    PromiseIterator.prototype.forEach = function (callback) {
        while (true) {
            var i = await(this.next());
            if (i.done)
                break;
            callback(i.value);
        }
    };
    return PromiseIterator;
})();
module.exports = PromiseIterator;
//# sourceMappingURL=promiseIterator.js.map
