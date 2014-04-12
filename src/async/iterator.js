var Promise = require('bluebird');

var await = require('../await/index');

/**
* TODO: ...
*/
var Iterator = (function () {
    /**
    * TODO: ...
    */
    function Iterator(fiber, context) {
        this.fiber = fiber;
        this.context = context;
    }
    /**
    * TODO: ...
    */
    Iterator.prototype.next = function () {
        var value = Promise.defer();
        var done = Promise.defer();
        this.context.value = value;
        this.context.done = done;

        // Run the fiber until it either yields a value or completes
        this.fiber.run(this.context);

        return { value: value.promise, done: done.promise };
    };

    /**
    * TODO: ...
    */
    Iterator.prototype.forEach = function (callback) {
        while (true) {
            var i = this.next();
            if (await(i.done)) {
                this.fiber = null;
                this.context = null;
                break;
            }
            callback(await(i.value));
        }
    };
    return Iterator;
})();
module.exports = Iterator;
//# sourceMappingURL=iterator.js.map
