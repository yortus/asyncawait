var Fiber = require('fibers');
var Promise = require('bluebird');
var await = require('./await');

//TODO: ...
(function (AsyncOutput) {
    AsyncOutput[AsyncOutput["Promise"] = 0] = "Promise";
    AsyncOutput[AsyncOutput["PromiseIterator"] = 1] = "PromiseIterator";
})(exports.AsyncOutput || (exports.AsyncOutput = {}));
var AsyncOutput = exports.AsyncOutput;

/**
* The wrapper() function accepts a Context instance, and calls the wrapped function which is
* described in the context. The result of the call is used to resolve the context's promise.
* If an exception is thrown, the context's promise is rejected. This function must take all
* its information in a single argument (i.e. the context), because it is called via
* Fiber#run(), which accepts at most one argument.
*/
function wrapper(ctx) {
    try  {
        // Keep track of how many fibers are active
        adjustFiberCount(+1);

        // Call the wrapped function. It may get suspended at await and/or yield calls.
        var result = ctx.wrapped.apply(ctx.thisArg, ctx.argsAsArray);

        switch (ctx.output) {
            case 0 /* Promise */:
                ctx.value.resolve(result);
                break;
            case 1 /* PromiseIterator */:
                ctx.value.resolve(undefined);
                ctx.done.resolve(true);
                break;
        }
    } catch (err) {
        switch (ctx.output) {
            case 0 /* Promise */:
                ctx.value.reject(err);
                break;
            case 1 /* PromiseIterator */:
                ctx.value.reject(err);
                ctx.done.resolve(true);
                break;
        }
    } finally {
        // Keep track of how many fibers are active
        adjustFiberCount(-1);

        // TODO: for semaphores
        ctx.semaphore.leave();
    }
}
exports.wrapper = wrapper;

/** A class for encapsulating the single argument passed to the wrapper() function. */
var Context = (function () {
    function Context(output, wrapped, thisArg, argsAsArray, semaphore) {
        this.output = output;
        this.wrapped = wrapped;
        this.thisArg = thisArg;
        this.argsAsArray = argsAsArray;
        this.semaphore = semaphore;
    }
    return Context;
})();
exports.Context = Context;

/** A simple abstraction for limiting concurrent function calls to a specific upper bound. */
var Semaphore = (function () {
    function Semaphore(n) {
        this.n = n;
        this._queued = [];
        this._avail = n;
    }
    Semaphore.prototype.enter = function (fn) {
        if (this._avail > 0) {
            --this._avail;
            fn();
        } else {
            this._queued.push(fn);
        }
    };

    Semaphore.prototype.leave = function () {
        if (this._queued.length > 0) {
            var fn = this._queued.pop();
            fn();
        } else {
            ++this._avail;
        }
    };
    Semaphore.unlimited = new Semaphore(10000000);
    return Semaphore;
})();
exports.Semaphore = Semaphore;

/**
* The following functionality prevents memory leaks in node-fibers by actively managing Fiber.poolSize.
* For more information, see https://github.com/laverdet/node-fibers/issues/169.
*/
var fiberPoolSize = Fiber.poolSize;
var activeFiberCount = 0;
function adjustFiberCount(delta) {
    activeFiberCount += delta;
    if (activeFiberCount >= fiberPoolSize) {
        fiberPoolSize += 100;
        Fiber.poolSize = fiberPoolSize;
    }
}

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
        this.fiber['value'] = value;
        this.fiber['done'] = done;

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
exports.Iterator = Iterator;
