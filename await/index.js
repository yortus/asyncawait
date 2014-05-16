var Fiber = require('fibers');
var Promise = require('bluebird');
var _ = require('lodash');

var await = makeAwaitFunc();

function makeAwaitFunc() {
    var traverse = traverseClone;
    var topN = null;

    return function await() {
        if (!Fiber.current) {
            throw new Error('await functions, yield functions, and pseudo-synchronous suspendable ' + 'functions may only be called from inside a suspendable function. ');
        }

        if (arguments.length === 1) {
            var expr = arguments[0];
        } else {
            expr = new Array(arguments.length);
            for (var i = 0; i < arguments.length; ++i)
                expr[i] = arguments[i];
            traverse = traverseInPlace;
        }

        var fiber = Fiber.current;
        if (expr && _.isFunction(expr.then)) {
            expr.then(function (val) {
                fiber.run(val);
                fiber = null;
            }, function (err) {
                fiber.throwInto(err);
                fiber = null;
            });
        } else if (_.isFunction(expr)) {
            expr(function (err, val) {
                if (err)
                    fiber.throwInto(err);
                else
                    fiber.run(val);
                fiber = null;
            });
        } else if (_.isArray(expr) || _.isPlainObject(expr)) {
            var trackedPromises = [];
            expr = traverse(expr, trackAndReplaceWithResolvedValue(trackedPromises));
            if (!topN) {
                Promise.all(trackedPromises).then(function (val) {
                    fiber.run(expr);
                    fiber = null;
                }, function (err) {
                    fiber.throwInto(err);
                    fiber = null;
                });
            } else {
                Promise.some(trackedPromises, topN).then(function (val) {
                    fiber.run(val);
                    fiber = null;
                }, function (err) {
                    fiber.throwInto(err);
                    fiber = null;
                });
            }
        } else {
            setImmediate(function () {
                fiber.run(expr);
                fiber = null;
            });
        }

        return Fiber.yield();
    };
}

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

function trackAndReplaceWithResolvedValue(tracking) {
    return function (obj, key) {
        var val = obj[key];
        if (!val)
            return;

        if (_.isFunction(val))
            val = thunkToPromise(val);

        if (_.isFunction(val.then)) {
            tracking.push(val);
            val.then(function (result) {
                obj[key] = result;
            });
        }
    };
}

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
