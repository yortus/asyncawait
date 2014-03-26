import _refs = require('_refs');
import Fiber = require('fibers');
import Promise = require('bluebird');
import deep = require('deep');
export = await;


// This is the await() API function (see docs).
var await: AsyncAwait.IAwait = function(expr) {

    // Set up promise settlement handlers that either resume, or throw into, the current fiber.
    var fiber = Fiber.current;
    function onResolved(val) { fiber.run(val); }
    function onRejected(err) { fiber.throwInto(err); }

    // Reduce expr to a single promise.
    expr = reduceToPromise(expr);

    // Install the above promise handlers.
    expr.then(onResolved, onRejected);

    // Suspend the current fiber until the promise settles. When the fiber is resumed,
    // return the resolved value of expr's promise.
    return Fiber.yield();
}

// Create a single promise that is settled when the expression is fully settled.
function reduceToPromise(expr) {

    // A falsy value - return a promise already resolved to the falsy value.
    if (!expr) return Promise.resolve(expr);

    // A promise - return it verbatim.
    var isPromise = typeof expr.then === 'function';
    if (isPromise) return expr;

    // A thunk - return a promise that settles when the callback is called.
    var isThunk = typeof expr === 'function';
    if (isThunk) return thunkToPromise(expr);

    // A plain object or array - return a promise of a deep clone with all contained promises resolved.
    var typeName = Object.prototype.toString.call(expr);
    if (typeName === '[object Object]' || typeName === '[object Array]') {

        // Clone the original object so we don't modify it, converting thunks to promises along the way.
        var clone = deep.transform(expr, obj => typeof obj === 'function', thunkToPromise);

        // Select all the promises in the object graph.
        var proms = [], paths = deep.select(clone, obj => obj && typeof obj.then === 'function');
        for (var i = 0; i < paths.length; ++i) proms.push(paths[i].value);

        // Create a new promise that resolves when all the above promises are resolved.
        return Promise.all(proms).then(val => {

            // Substitute each promise for its resolution value.
            for (var i = 0; i < paths.length; ++i) deep.set(clone, paths[i].path, val[i]);
            return clone;
        });
    }

    // Anything else - return a promise already resolved to the value of expr.
    return Promise.resolve(expr);
}

// Convert a thunk to a promise
function thunkToPromise(thunk: Function) {
    return new Promise((resolve, reject) => {
        var callback = (err, val) => (err ? reject(err) : resolve(val));
        thunk(callback);
    });
}
