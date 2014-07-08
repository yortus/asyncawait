//import assert = require('assert');
//import Fiber = require('fibers');
var _ = require('./util');

//import Protocol = AsyncAwait.Async.Protocol;
//import Coroutine = AsyncAwait.Coroutine;
//TODO: configurable built-ins?
//TODO: doc...
var extensions = [
    require('./extensions/defaultPipeline'),
    require('./extensions/fiberPoolResizer'),
    require('./extensions/maxConcurrency')
];

//TODO: doc...
function use(extension) {
    //TODO: ...
    if (pipeline)
        throw new Error('use: cannot add extensions after first async(...) call');

    //TODO: handle ordering properly - may need to separate builtins from use-added stuff
    extensions.push(extension);
}
exports.use = use;

//TODO: doc...
function getPipeline() {
    if (!pipeline)
        loadExensions();
    return pipeline;
}
exports.getPipeline = getPipeline;

//TODO: doc...
function loadExensions() {
    var len = extensions.length;

    for (var i = 0; i < len; ++i) {
        var overrides = extensions[i](pipeline);
        pipeline = _.mergeProps({}, pipeline, overrides);
    }
}

//TODO: doc...
var pipeline;
//# sourceMappingURL=pipeline.js.map
