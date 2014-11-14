var assert = require('assert');
var Fiber = require('fibers');

/** Specify whether to execute in DEBUG mode. */
exports.DEBUG = true;

/** Determines whether the given object is a string. */
function isString(obj) {
    return typeof obj === 'string';
}
exports.isString = isString;

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
    return obj !== null && typeof obj === 'object';
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

//TODO: recursively merge own props that are plain objects? Would be nice for config.
/** Equivalent to lodash's _.assign() function. */
//export var mergeProps: (...args) => any = () => {
//    var len = arguments.length, target = arguments[0];
//    assert(len > 0, 'mergeProps: expected at least one argument');
//    assert(target, 'mergeProps: first argument must be an object');
//    for (var i = 1; i < len; ++i) {
//        var source = arguments[i];
//        if (!source) continue;
//        for (var prop in source) {
//            if (!source.hasOwnProperty(prop)) break;
//            target[prop] = source[prop];
//        }
//    }
//    return target;
//};
//TODO:...
exports.mergePropsDeep = function () {
    var len = arguments.length, target = arguments[0];
    assert(len > 0, 'mergePropsDeep: expected at least one argument');
    assert(exports.isObject(target), 'mergePropsDeep: first argument must be an object');
    for (var i = 1; i < len; ++i) {
        var source = arguments[i];
        if (!source)
            continue;
        for (var prop in source) {
            if (!source.hasOwnProperty(prop))
                break;
            var tgt = target[prop], src = source[prop];
            var recurse = exports.isPlainObject(tgt) && exports.isPlainObject(src);
            if (recurse)
                exports.mergePropsDeep(tgt, src);
            else
                target[prop] = clone(src);
        }
    }
    return target;
};

//TODO:...
function clone(obj) {
    if (exports.isPlainObject(obj)) {
        var co = {};
        for (var k in obj)
            co[k] = clone(obj[k]);
        return co;
    } else if (exports.isArray(obj)) {
        var len = obj.length, ca = new Array(len);
        for (var i = 0; i < len; ++i)
            ca[i] = clone(obj[i]);
        return ca;
    } else {
        return obj;
    }
}

//TODO: ever used?
/** Creates a new object that has the given object as its prototype */
//export function branch(proto) {
//    function O() { }
//    O.prototype = proto;
//    return new O();
//}
/** Returns the currently executing fiber, if any. */
function currentFiber() {
    return Fiber.current;
}
exports.currentFiber = currentFiber;

/** Yields control from the currently executing fiber back to its caller. */
function yieldCurrentFiber(value) {
    return Fiber.yield(value);
}
exports.yieldCurrentFiber = yieldCurrentFiber;

/** Sentinel value that a function may return to indicate that it did no processing. */
exports.notHandled = {};

//TODO: this is not really a util! Move it! It is used by cpsKeyword, await.cps
//TODO: temp testing... needed to move it here to avoid circular ref cpsKeyword->cps->awaitBuilder->extensibility->cpsKeyword
function createContinuation() {
    var fi = exports.currentFiber();
    var i = fi.awaiting.length++;
    return function continue_(err, result) {
        fi.awaiting[i](err, result);
        fi = null;
    };
}
exports.createContinuation = createContinuation;

//TODO:...
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(fn) {
    var fnSource = fn.toString().replace(STRIP_COMMENTS, '');
    var result = fnSource.slice(fnSource.indexOf('(') + 1, fnSource.indexOf(')')).match(ARGUMENT_NAMES);
    return result || [];
}
exports.getParamNames = getParamNames;
//# sourceMappingURL=util.js.map
