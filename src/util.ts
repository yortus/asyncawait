import references = require('references');
import assert = require('assert');


/** Specify whether to execute in DEBUG mode. */
export var DEBUG = false;


/** Determines whether the given object is a function. */
export function isFunction(obj) {
    return typeof obj === 'function';
}


/** Determines whether the given object is an array. */
export function isArray(obj) {
    return Array.isArray(obj);
}


/** Determines whether the given object is an object (i.e., anything other than a primitive). */
export function isObject(obj) {
    return typeof obj === 'object';
}


/** Determines whether the given object is a plain object (i.e., it's constructor is Object). */
export function isPlainObject(obj) {
    return typeof obj === 'object' && obj.constructor == Object;
}


/** Determines whether the given object is a number. */
export function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}


/** Determines whether the given object is a promise/thenable. */
export function isPromise(obj) {
    return isObject(obj) && typeof obj.then === 'function';
}


/** Equivalent to lodash's _.assign() function. */
export var mergeProps: (...args) => any = () => {
    var len = arguments.length, target = arguments[0];
    assert(len > 0, 'mergeProps: expected at least one argument');
    assert(target, 'mergeProps: first argument must be an object');
    for (var i = 1; i < len; ++i) {
        var source = arguments[i];
        if (!source) continue;
        for (var prop in source) {
            if (!source.hasOwnProperty(prop)) break;
            target[prop] = source[prop];
        }
    }
    return target;
}


/** An empty, no-op function. */
export function empty(): any { }


/**
 *  Returns an array containing the declared parameter names of the given function.
 *  NB: Not for use on hot paths! The operation uses [function].toString and regexes.
 *  Source: http://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically-from-javascript
 */
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
export function getParamNames(func: Function) {
    var source = func.toString().replace(STRIP_COMMENTS, '');
    var result = source.slice(source.indexOf('(') + 1, source.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null) result = [];
    return result;
}
