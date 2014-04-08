var Fiber = require('fibers');
var Promise = require('bluebird');
var await = require('./await');

function wrapper(context) {
    try  {
        context.wrapped.apply(context.thisArg, context.argsAsArray);
        context.value.resolve(undefined);
        context.done.resolve(true);
    } catch (err) {
        context.value.reject(err);
        context.done.resolve(true);
    }
}

// This is the iterable() API function (see docs).
var iterable = function (fn) {
    // Return a function that returns an iterator.
    return function () {
        // Capture initial arguments used to start the iterator.
        var initArgs = new Array(arguments.length);
        for (var i = 0; i < initArgs.length; ++i)
            initArgs[i] = arguments[i];

        // 1 iterator <==> 1 fiber
        var fiber = Fiber(wrapper);
        var context = {
            wrapped: fn,
            thisArg: null,
            argsAsArray: initArgs,
            value: null,
            done: null
        };

        //TODO...
        var result = new Iterator(fiber, context);
        return result;
    };
};

var Iterator = (function () {
    function Iterator(fiber, context) {
        this.fiber = fiber;
        this.context = context;
    }
    Iterator.prototype.next = function () {
        var value = Promise.defer();
        var done = Promise.defer();

        this.context.value = value;
        this.context.done = done;
        this.fiber['value'] = value;
        this.fiber['done'] = done;

        // Run the fiber until it either yields a value or completes
        this.fiber.run(this.context);

        return { value: value.promise, done: done.promise };
    };

    Iterator.prototype.forEach = function (callback) {
        while (true) {
            var i = this.next();
            if (await(i.done))
                break;
            callback(await(i.value));
        }
    };
    return Iterator;
})();
module.exports = iterable;
