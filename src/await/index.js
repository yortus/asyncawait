var Fiber = require('fibers');
var Promise = require('bluebird');
var _ = require('lodash');

//TODO: split into separate index/factory files
//TODO: put vsdoc back here
var await;
await = createAwaitFunction({ inPlace: false });
await.inPlace = createAwaitFunction({ inPlace: true });


/** Function for creating a specific variant of the await() function. */
function createAwaitFunction(options) {
    // Return an await function tailored to the given options.
    var traverseFunction = options.inPlace ? traverseInPlace : traverseClone;
    return function (expr_) {
        // Ensure this function is executing inside a fiber.
        if (!Fiber.current) {
            throw new Error('await functions, yield functions, and value-returning suspendable ' + 'functions may only be called from inside a suspendable function. ');
        }

        // Parse argument(s). If not a single argument, treat it like an array was passed in.
        var traverse = traverseFunction;
        var expr = expr_;
        if (arguments.length !== 1) {
            expr = new Array(arguments.length);
            for (var i = 0; i < arguments.length; ++i)
                expr[i] = arguments[i];
            traverse = traverseInPlace;
        }

        // Handle each supported 'awaitable' appropriately...
        var fiber = Fiber.current;
        if (expr && _.isFunction(expr.then)) {
            // A promise: resume the coroutine with the resolved value, or throw the rejection value into it.
            expr.then(function (val) {
                fiber.run(val);
                fiber = null;
            }, function (err) {
                fiber.throwInto(err);
                fiber = null;
            });
        } else if (_.isFunction(expr)) {
            // A thunk: resume the coroutine with the callback value, or throw the errback value into it.
            expr(function (err, val) {
                if (err)
                    fiber.throwInto(err);
                else
                    fiber.run(val);
                fiber = null;
            });
        } else if (_.isArray(expr) || _.isPlainObject(expr)) {
            // An array or plain object: resume the coroutine with a deep clone of the array/object,
            // where all contained promises and thunks have been replaced by their resolved values.
            var trackedPromises = [];
            expr = traverse(expr, trackAndReplaceWithResolvedValue(trackedPromises));
            Promise.all(trackedPromises).then(function (val) {
                return fiber.run(expr);
            }, function (err) {
                return fiber.throwInto(err);
            });
        } else {
            // Anything else: resume the coroutine immediately with the value.
            setImmediate(fiber.run.bind(fiber), expr);
        }

        // Suspend the current fiber until the one of the above handlers resumes it again.
        return Fiber.yield();
    };
}

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
module.exports = await;
//# sourceMappingURL=index.js.map
