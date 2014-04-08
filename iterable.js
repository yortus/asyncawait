var Fiber = require('fibers');
var Promise = require('bluebird');

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
        return {
            next: function () {
                var value = Promise.defer();
                var done = Promise.defer();

                context.value = value;
                context.done = done;
                fiber['value'] = value;
                fiber['done'] = done;

                // Run the fiber until it either yields a value or completes
                fiber.run(context);

                // We don't need to pass the initial arguments after the first run of the fiber
                initArgs = [];

                return { value: value.promise, done: done.promise };
            }
        };
    };
};
module.exports = iterable;
