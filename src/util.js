var assert = require('assert');

/** Specify whether to execute in DEBUG mode. */
exports.DEBUG = false;

/** Determines whether the given object is a function. */
function isFunction(obj) {
    return typeof obj === 'function';
}
exports.isFunction = isFunction;

/** Determines whether the given object is an array. */
function isArray(obj) {
    return Array.isArray(obj);
}
exports.isArray = isArray;

/** Determines whether the given object is an object (i.e., anything other than a primitive). */
function isObject(obj) {
    return typeof obj === 'object';
}
exports.isObject = isObject;

/** Determines whether the given object is a plain object (i.e., it's constructor is Object). */
function isPlainObject(obj) {
    return typeof obj === 'object' && obj.constructor == Object;
}
exports.isPlainObject = isPlainObject;

/** Determines whether the given object is a number. */
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
exports.isNumber = isNumber;

/** Determines whether the given object is a promise/thenable. */
function isPromise(obj) {
    return exports.isObject(obj) && typeof obj.then === 'function';
}
exports.isPromise = isPromise;

/** An empty, no-op function. */
function empty() {
}
exports.empty = empty;

/** Equivalent to lodash's _.assign() function. */
exports.mergeProps = function () {
    var len = arguments.length, target = arguments[0];
    assert(len > 0, 'mergeProps: expected at least one argument');
    assert(target, 'mergeProps: first argument must be an object');
    for (var i = 1; i < len; ++i) {
        var source = arguments[i];
        if (!source)
            continue;
        for (var prop in source) {
            if (!source.hasOwnProperty(prop))
                break;
            target[prop] = source[prop];
        }
    }
    return target;
};

/** Creates a new object that has the given object as its prototype */
function branch(proto) {
    function O() {
    }
    O.prototype = proto;
    return new O();
}
exports.branch = branch;
//# sourceMappingURL=util.js.map
