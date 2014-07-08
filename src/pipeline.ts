import references = require('references');
//import assert = require('assert');
//import Fiber = require('fibers');
import _ = require('./util');
import Extension = AsyncAwait.Extension;
import Pipeline = AsyncAwait.Pipeline;
//import Protocol = AsyncAwait.Async.Protocol;
//import Coroutine = AsyncAwait.Coroutine;



//TODO: configurable built-ins?
//TODO: doc...
//TODO: clear all?
var extensions: Extension[] = [
    require('./extensions/defaultPipeline'),
    require('./extensions/fiberPoolResizer')
    //require('./extensions/maxConcurrency')(10000)
];


//TODO: doc...
export function use(extension: Extension) {

    //TODO: ...
    if (pipeline) throw new Error('use: cannot add extensions after first async(...) call');

    //TODO: handle ordering properly - may need to separate builtins from use-added stuff
    extensions.push(extension);
}


//TODO: doc...
export function getPipeline(): Pipeline {
    if (!pipeline) loadExensions();
    return pipeline;
}


//TODO: doc... used for unit testing
export function reset() {
    pipeline = null;

    //TODO: clear all?
    var extensions: Extension[] = [
        require('./extensions/defaultPipeline'),
        require('./extensions/fiberPoolResizer')
        //require('./extensions/maxConcurrency')(10000)
    ];

}


//TODO: doc...
function loadExensions() {
    var len = extensions.length;
    //TODO: was...for (var i = len - 1; i >= 0; --i) {
    for (var i = 0; i < len; ++i) {
        var overrides = extensions[i](pipeline);
        pipeline = _.mergeProps({}, pipeline, overrides);
    }
}


//TODO: doc...
var pipeline: Pipeline;
