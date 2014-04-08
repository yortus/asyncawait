import _refs = require('_refs');
import Fiber = require('fibers');
import Promise = require('bluebird');
import await = require('./await');
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
        var result = new Iterator(fiber, context);
        return <{ next: Function; forEach: Function; }> result;
    };
};


class Iterator {
    constructor(private fiber: Fiber, private context: Context) {}

    next(): { value: Promise<any>; done: Promise<boolean> } {
        var value = Promise.defer<any>();
        var done = Promise.defer<boolean>();

        this.context.value = value;
        this.context.done = done;
        this.fiber['value'] = value;
        this.fiber['done'] = done;

        // Run the fiber until it either yields a value or completes
        this.fiber.run(this.context);

        return { value: value.promise, done: done.promise };
    }

    forEach(callback: (value) => void) {
        while (true) {
            var i = this.next();
            if (await (i.done)) break;
            callback(await (i.value));
        }
    }
}
