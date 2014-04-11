import _refs = require('_refs');
import Fiber = require('fibers');
import Promise = require('bluebird');
import _ = require('lodash');
export = await;


/**
 * Suspends an async-wrapped function until the awaitable expression expr produces a result.
 * If expr produces an error, then an exception is raised in the async-wrapped function.
 * @param {any} expr - The awaitable expression whose results are to be awaited.
 * @returns {any} The final result of the awaitable expression expr.
 */
var await: AsyncAwait.IAwait = function(expr_) {

    // Parse argument(s). If not a single argument, treat it like an array was passed in.
    var expr = expr_;
    if (arguments.length !== 1) {
        expr = new Array(arguments.length);
        for (var i = 0; i < arguments.length; ++i) expr[i] = arguments[i];
    }

    // Handle each supported 'awaitable' appropriately...
    var fiber = Fiber.current;
    if (_.isFunction(expr.then)) {

        // A promise: resume the coroutine with the resolved value, or throw the rejection value into it.
        expr.then(val => { fiber.run(val); fiber = null; }, err => { fiber.throwInto(err); fiber = null; });
    }
    else if (_.isFunction(expr)) {

        // A thunk: resume the coroutine with the callback value, or throw the errback value into it.
        expr((err, val) => { if (err) fiber.throwInto(err); else fiber.run(val); fiber = null; });
    }
    else if (_.isArray(expr) || _.isPlainObject(expr)) {

        // An array or plain object: resume the coroutine with a deep clone of the array/object,
        // where all contained promises and thunks have been replaced by their resolved values.
        var trackedPromises = [];
        //TODO:... implement option choosing for clone / don't clone
        var traverse = traverseInPlace;
        //var traverse = traverseClone;
        expr = traverse(expr, trackAndReplaceWithResolvedValue(trackedPromises));
        Promise.all(trackedPromises).then(val => fiber.run(expr), err => fiber.throwInto(err));

    } else {

        // Anything else: resume the coroutine immediately with the value.
        setImmediate(fiber.run.bind(fiber), expr);
    }

    // Suspend the current fiber until the one of the above handlers resumes it again.
    return Fiber.yield();
}


// In-place (ie non-cloning) object traversal.
function traverseInPlace(o, visitor: (obj, key) => void): any {
    if (_.isArray(o)) {
        var len = o.length;
        for (var i = 0; i < len; ++i) {
            traverseInPlace(o[i], visitor);
            visitor(o, i);
        }
    } else if (_.isPlainObject(o)) {
        for (var key in o) {
            if (!o.hasOwnProperty(key)) continue;
            traverseInPlace(o[key], visitor);
            visitor(o, key);
        }
    }
    return o;
}


// Object traversal with cloning.
function traverseClone(o, visitor: (obj, key) => void): any {
    var result;
    if (_.isArray(o)) {
        var len = o.length;
        result = new Array(len);
        for (var i = 0; i < len; ++i) {
            result[i] = traverseClone(o[i], visitor);
            visitor(result, i);
        }
    } else if (_.isPlainObject(o)) {
        result = {};
        for (var key in o) {
            if (o.hasOwnProperty(key)) {
                result[key] = traverseClone(o[key], visitor);
                visitor(result, key);
            }
        }
    } else {
        result = o;
    }
    return result;
}


// Visitor function factory for handling thunks and promises in awaited object graphs.
function trackAndReplaceWithResolvedValue(tracking: Promise<any>[]) {

    // Return a visitor function closed over the specified tracking array.
    return (obj, key) => {

        // Get the value being visited, and return early if it's falsy.
        var val = obj[key];
        if (!val) return;

        // If the value is a thunk, convert it to an equivalent promise.
        if (_.isFunction(val)) val = thunkToPromise(val);

        // If the value is a promise, add it to the tracking array, and replace it with its value when resolved.
        if (_.isFunction(val.then)) {
            tracking.push(val);
            val.then(result => { obj[key] = result });
        }
    }
}


// Convert a thunk to a promise.
function thunkToPromise(thunk: Function) {
    return new Promise((resolve, reject) => {
        var callback = (err, val) => (err ? reject(err) : resolve(val));
        thunk(callback);
    });
}
