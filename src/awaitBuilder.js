var Fiber = require('./fibers');
var Promise = require('bluebird');
var _ = require('lodash');


function createAwaitBuilder(handler) {
    var builder = function await(expr) {
        // Ensure this function is executing inside a fiber.
        var fiber = Fiber.current;
        if (!fiber) {
            throw new Error('await functions, yield functions, and pseudo-synchronous suspendable ' + 'functions may only be called from inside a suspendable function. ');
        }

        // Handle...
        var flag = handler(expr, function (err, result) {
            if (err)
                fiber.throwInto(err);
            else
                fiber.run(result);
        });
        if (flag === false) {
            throw new Error('not handled!');
        }

        return Fiber.yield();
    };

    return builder;
}
exports.createAwaitBuilder = createAwaitBuilder;

exports.generalHandler = function (expr, resume) {
    //TODO: temp testing...
    var traverse = traverseClone;
    var topN = null;

    // Handle each supported 'awaitable' appropriately...
    if (expr && _.isFunction(expr.then)) {
        // A promise: resume the coroutine with the resolved value, or throw the rejection value into it.
        expr.then(function (val) {
            return resume(null, val);
        }, resume);
    } else if (_.isFunction(expr)) {
        // A thunk: resume the coroutine with the callback value, or throw the errback value into it.
        expr(resume);
    } else if (_.isArray(expr) || _.isPlainObject(expr)) {
        // An array or plain object: resume the coroutine with a deep clone of the array/object,
        // where all contained promises and thunks have been replaced by their resolved values.
        var trackedPromises = [];
        expr = traverse(expr, trackAndReplaceWithResolvedValue(trackedPromises));
        if (!topN) {
            Promise.all(trackedPromises).then(function (val) {
                return resume(null, val);
            }, resume);
        } else {
            Promise.some(trackedPromises, topN).then(function (val) {
                return resume(null, val);
            }, resume);
        }
    } else {
        // Anything else: resume the coroutine immediately with the value.
        setImmediate(function () {
            return resume(null, expr);
        });
    }
};

/** In-place (ie non-cloning) object traversal. */
function traverseInPlace(o, visitor) {
    if (_.isArray(o)) {
        var len = o.length;
        for (var i = 0; i < len; ++i) {
            traverseInPlace(o[i], visitor);
            visitor(o, i);
        }
    } else if (_.isPlainObject(o)) {
        for (var key in o) {
            if (!o.hasOwnProperty(key))
                continue;
            traverseInPlace(o[key], visitor);
            visitor(o, key);
        }
    }
    return o;
}

/** Object traversal with cloning. */
function traverseClone(o, visitor) {
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

/** Visitor function factory for handling thunks and promises in awaited object graphs. */
function trackAndReplaceWithResolvedValue(tracking) {
    // Return a visitor function closed over the specified tracking array.
    return function (obj, key) {
        // Get the value being visited, and return early if it's falsy.
        var val = obj[key];
        if (!val)
            return;

        // If the value is a thunk, convert it to an equivalent promise.
        if (_.isFunction(val))
            val = thunkToPromise(val);

        // If the value is a promise, add it to the tracking array, and replace it with its value when resolved.
        if (_.isFunction(val.then)) {
            tracking.push(val);
            val.then(function (result) {
                obj[key] = result;
            });
        }
    };
}

/** Convert a thunk to a promise. */
function thunkToPromise(thunk) {
    return new Promise(function (resolve, reject) {
        var callback = function (err, val) {
            return (err ? reject(err) : resolve(val));
        };
        thunk(callback);
    });
}
//# sourceMappingURL=awaitBuilder.js.map
