import references = require('references');
import assert = require('assert');


//TODO: ...
export function isFunction(obj) {
    return typeof obj === 'function';
}


//TODO: ... find all refs, remove?
export function isArray(obj) {
    return typeof obj === 'function';
}


//TODO: ... find all refs, remove?
export function isPlainObject(obj) {
    return typeof obj === 'object' && obj.constructor == Object;
}


//TODO: ...
export function mergeProps(...args) {
    var len = arguments.length, target = arguments[0];
    assert(len > 0, 'mergeProps: expected at least one argument');
    assert(target, 'mergeProps: first argument must be an object');
    for (var i = 1; i < len; ++i) {
        var source = arguments[i];
        if (!source) break;
        for (var prop in source) {
            if (!source.hasOwnProperty(prop)) break;
            target[prop] = source[prop];
        }
    }
    return target;
}


//TODO: ...
export function empty(): any { }


//TODO:...
// Source: http://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically-from-javascript
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
export function getParamNames(func: Function) {
    var source = func.toString().replace(STRIP_COMMENTS, '');
    var result = source.slice(source.indexOf('(') + 1, source.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null) result = [];
    return result;
}
