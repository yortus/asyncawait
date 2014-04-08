import _refs = require('_refs');
import Fiber = require('fibers');
import Promise = require('bluebird');
export = iterable;


interface Context {
    wrapped: Function;
    thisArg: any;
    argsAsArray: any[];
    value: Promise.Resolver<any>;
    done: Promise.Resolver<boolean>;
}


function wrapper(context: Context) {
    try {
        context.wrapped.apply(context.thisArg, context.argsAsArray);
        context.value.resolve(undefined);
        context.done.resolve(true);
    }
    catch (err) {
        context.value.reject(err);
        context.done.resolve(true);
    }
}


// This is the iterable() API function (see docs).
var iterable = function(fn: Function) {

    // Return a function that returns an iterator.
    return function () {

        // Capture initial arguments used to start the iterator.
        var initArgs = new Array(arguments.length);
        for (var i = 0; i < initArgs.length; ++i) initArgs[i] = arguments[i];

        // 1 iterator <==> 1 fiber
        var fiber = Fiber(wrapper);
        var context: Context = {
            wrapped: fn,
            thisArg: null,
            argsAsArray: initArgs,
            value: null,
            done: null
        };

        //TODO...
        return {
            next: function() {

                var value = Promise.defer<any>();
                var done = Promise.defer<boolean>();

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
