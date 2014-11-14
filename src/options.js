var _ = require('./util');

//TODO: doc all...
function get() {
    return _options;
}
exports.get = get;

function set(value, preserveExisting) {
    var under = preserveExisting ? value : _options;
    var over = preserveExisting ? _options : value;
    _options = _.mergePropsDeep({}, under, over);
    _listeners.forEach(function (cb) {
        return cb(_options);
    });
}
exports.set = set;

function onChange(callback) {
    _listeners.push(callback);
}
exports.onChange = onChange;

var _options = {};

var _listeners;
//# sourceMappingURL=options.js.map
