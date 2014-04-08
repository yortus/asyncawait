var Fiber = require('fibers');
var Promise = require('bluebird');
var deep = require('deep');

// This is the await() API function (see docs).
var awaitNew = function (expr_) {
    // Parse argument(s). If not a single argument, treat it like an array was passed in.
    var expr = expr_;
    if (arguments.length !== 1) {
        expr = new Array(arguments.length);
        for (var i = 0; i < arguments.length; ++i)
            expr[i] = arguments[i];
    }

    // Handle each supported 'awaitable' appropriately...
    var fiber = Fiber.current, typeName;
    if (!expr) {
        // A falsy value: resume the coroutine with the value.
        setImmediate(fiber.run, fiber, expr);
    } else if (typeof expr.then === 'function') {
        // A promise: resume the coroutine with the resolved value, or throw the rejection value into it.
        expr.then(function (val) {
            return fiber.run(val);
        }, function (err) {
            return fiber.throwInto(err);
        });
    } else if (typeof expr === 'function') {
        // A thunk: resume the coroutine with the callback value, or throw the errback value into it.
        expr(function (err, val) {
            if (err)
                fiber.throwInto(err);
            else
                fiber.run(val);
        });
    } else if ('[object Array]' === (typeName = Object.prototype.toString.call(expr))) {
        //TODO: reword: An array: resume the coroutine with a resolved array as per Promise.all
        //TODO: handle thunks in there too
        Promise.all(expr).then(function (val) {
            return fiber.run(val);
        }, function (err) {
            return fiber.throwInto(err);
        });
    } else if (typeName === '[object Object]') {
        throw new Error('NOT IMPLEMENTED!!!!!');
    } else {
        // Anything else: resume the coroutine with the value.
        setImmediate(fiber.run, fiber, expr);
    }

    // Suspend the current fiber until the one of the above handlers runs it again.
    // TODO: reword:  When the fiber is resumed, return the resolved value of expr's promise.
    return Fiber.yield();
};

//TODO: Remove once the plain object case has been properly transferred to above code
var await = function (expr) {
    // Set up promise settlement handlers that either resume, or throw into, the current fiber.
    var fiber = Fiber.current;
    function onResolved(val) {
        fiber.run(val);
    }
    function onRejected(err) {
        fiber.throwInto(err);
    }

    // Reduce expr to a single promise.
    expr = reduceToPromise(expr);

    // Install the above promise handlers.
    expr.then(onResolved, onRejected);

    // Suspend the current fiber until the promise settles. When the fiber is resumed,
    // return the resolved value of expr's promise.
    return Fiber.yield();
};

// Create a single promise that is settled when the expression is fully settled.
function reduceToPromise(expr) {
    // A falsy value - return a promise already resolved to the falsy value.
    if (!expr)
        return Promise.resolve(expr);

    // A promise - return it verbatim.
    var isPromise = typeof expr.then === 'function';
    if (isPromise)
        return expr;

    // A thunk - return a promise that settles when the callback is called.
    var isThunk = typeof expr === 'function';
    if (isThunk)
        return thunkToPromise(expr);

    // An array - return a promise of the same array instance with all contained promises replaced by their resolution values.
    var typeName = Object.prototype.toString.call(expr);
    if (typeName === '[object Array]') {
        // Make a promise that's resolved when all the array's thunks and promises are resolved.
        //var prom = Promise.resolve(expr);
        //for (var i = 0; i < expr.length; ++i) {
        //    var elem = expr[i];
        //    if (!elem) continue;
        //    if (typeof elem.then === 'function') {
        //        prom = prom.then(() => elem.then(expr)); // Promise
        //    } else if (typeof elem === 'function') {
        //        prom = prom.then(() => thunkToPromise(elem).then(expr)); // Thunk
        //    }
        //}
        var prom = Promise.all(expr);
        return prom;
    }

    // A plain object - return a promise of a deep clone with all contained promises resolved.
    if (typeName === '[object Object]') {
        // Clone the original object so we don't modify it, converting thunks to promises along the way.
        var clone = deep.transform(expr, function (obj) {
            return typeof obj === 'function';
        }, thunkToPromise);

        // Select all the promises in the object graph.
        var proms = [], paths = deep.select(clone, function (obj) {
            return obj && typeof obj.then === 'function';
        });
        for (var i = 0; i < paths.length; ++i)
            proms.push(paths[i].value);

        // Create a new promise that resolves when all the above promises are resolved.
        return Promise.all(proms).then(function (val) {
            for (var i = 0; i < paths.length; ++i)
                deep.set(clone, paths[i].path, val[i]);
            return clone;
        });
    }

    // Anything else - return a promise already resolved to the value of expr.
    return Promise.resolve(expr);
}

// Convert a thunk to a promise
function thunkToPromise(thunk) {
    return new Promise(function (resolve, reject) {
        var callback = function (err, val) {
            return (err ? reject(err) : resolve(val));
        };
        thunk(callback);
    });
}
module.exports = await;
