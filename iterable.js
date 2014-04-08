var Fiber = require('fibers');
var Promise = require('bluebird');

function wrapper(context) {
    var result = context.wrapped.apply(context.thisArg, context.argsAsArray);
    Fiber.current['value'].resolve(undefined);
    Fiber.current['done'].resolve(true);
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

        //TODO...
        return {
            next: function () {
                var value = Promise.defer();
                var done = Promise.defer();

                //TODO...
                //Promise.delay(1000).then(() => value.resolve('X'));
                //Promise.delay(1000).then(() => done.resolve(false));
                var context = {
                    wrapped: fn,
                    thisArg: null,
                    argsAsArray: initArgs
                };
                fiber['value'] = value;
                fiber['done'] = done;
                fiber.run(context);

                // We don't need to pass the initial arguments after the first run of the fiber
                initArgs = [];

                return { value: value.promise, done: done.promise };
            }
        };
    };
};
module.exports = iterable;
