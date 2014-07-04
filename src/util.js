var assert = require('assert');

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

/** Determines whether the given object is a plain object (i.e., it's constructor is Object). */
function isPlainObject(obj) {
    return typeof obj === 'object' && obj.constructor == Object;
}
exports.isPlainObject = isPlainObject;

/** Performs the same operation as lodash's _.assign() function. */
function mergeProps() {
    var args = [];
    for (var _i = 0; _i < (arguments.length - 0); _i++) {
        args[_i] = arguments[_i + 0];
    }
    var len = arguments.length, target = arguments[0];
    assert(len > 0, 'mergeProps: expected at least one argument');
    assert(target, 'mergeProps: first argument must be an object');
    for (var i = 1; i < len; ++i) {
        var source = arguments[i];
        if (!source)
            break;
        for (var prop in source) {
            if (!source.hasOwnProperty(prop))
                break;
            target[prop] = source[prop];
        }
    }
    return target;
}
exports.mergeProps = mergeProps;

/** An empty, no-op function. */
function empty() {
}
exports.empty = empty;

/**
*  Returns an array containing the declared parameter names of the given function.
*  NB: Not for use on hot paths! The operation uses [function].toString and regexes.
*  Source: http://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically-from-javascript
*/
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
    var source = func.toString().replace(STRIP_COMMENTS, '');
    var result = source.slice(source.indexOf('(') + 1, source.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}
exports.getParamNames = getParamNames;
//# sourceMappingURL=util.js.map
