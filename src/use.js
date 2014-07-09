var _ = require('./util');
var pipeline = require('./pipeline');


//TODO: doc...
function use(extension) {
    //TODO: ...
    if (pipeline.isLocked)
        throw new Error('use: cannot alter extensions after first async(...) call');

    //TODO: handle ordering properly - may need to separate builtins from use-added stuff
    var extensions = pipeline.extensions;
    extensions.push(extension);
    pipeline.reset();
    var len = extensions.length;
    for (var i = len - 1; i >= 0; --i) {
        var previous = _.mergeProps({}, pipeline);
        var overrides = extensions[i](previous);
        _.mergeProps(pipeline, overrides);
    }
}
module.exports = use;
//# sourceMappingURL=use.js.map
