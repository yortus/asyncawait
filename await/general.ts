import references = require('references');
import Promise = require('bluebird');
import Handler = AsyncAwait.Await.Handler;
import _ = require('../src/util');
import pipeline = require('../src/pipeline');
export = handler;


var handler: Handler = function generalHandler(co, args) {

    //TODO: temp testing...
    var traverse = traverseClone;
    var topN = null;


    var expr = args[0];


    if (_.isArray(expr) || _.isPlainObject(expr)) {

        // An array or plain object: resume the coroutine with a deep clone of the array/object,
        // where all contained promises and thunks have been replaced by their resolved values.
        var trackedPromises = [];
        expr = traverse(expr, trackAndReplaceWithResolvedValue(trackedPromises));
        if (!topN) {
            Promise.all(trackedPromises).then(val => co.enter(null, expr), co.enter);
        } else {
            Promise.some(trackedPromises, topN).then(val => co.enter(null, val), co.enter);
        }
    }
    else {
        return pipeline.notHandled;
    }
}


/** In-place (ie non-cloning) object traversal. */
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


/** Object traversal with cloning. */
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


/** Visitor function factory for handling thunks and promises in awaited object graphs. */
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


/** Convert a thunk to a promise. */
function thunkToPromise(thunk: Function) {
    return new Promise((resolve, reject) => {
        var callback = (err, val) => (err ? reject(err) : resolve(val));
        thunk(callback);
    });
}
