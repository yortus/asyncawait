var _ = require('./util');

function get() {
    return _options;
}
exports.get = get;

function set(value) {
    _.mergeProps(_options, value);
}
exports.set = set;

function clear() {
    _options = {};
}
exports.clear = clear;

// TODO: side-effect
exports.clear();

// TODO: private impl
var _options;
//# sourceMappingURL=options.js.map
