var Promise = require('bluebird');

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
        //TODO: also support cps...
        var nextValue = Promise.defer();
        this.runContext.resolver = nextValue;

        // Run the fiber until it either yields a value or completes
        this.fiber.run(this.runContext);

        return nextValue.promise;
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
