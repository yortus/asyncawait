var Fiber = require('fibers');
var Promise = require('bluebird');
var deep = require('deep');

// This is the await() API function (see docs).
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
    //console.log('==> in:  ' + JSON.stringify(expr, null, 2));
    expr = reduceToPromise(expr);

    //console.log('==> out: ' + JSON.stringify(expr, null, 2));
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

    // A plain object or array - return a promise of a deep clone with all contained promises resolved.
    var typeName = Object.prototype.toString.call(expr);
    if (typeName === '[object Object]' || typeName === '[object Array]') {
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
