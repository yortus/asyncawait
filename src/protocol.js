var assert = require('assert');
var _ = require('./util');


var Protocol = (function () {
    function Protocol(options, getMembers) {
        this.options = options;
        this.members = getMembers(options);
        this._getMembers = getMembers;
    }
    Protocol.prototype.mod = function (mod) {
        var _this = this;
        // Validate argument.
        assert(arguments.length === 1 && mod, 'mod: expected a single argument');
        assert(!mod.override || _.isFunction(mod.override), 'mod: expected override to be a function');

        // Compute the effective options object for the new protocol.
        var isOptionsOnly = !mod.override;
        var defaults = isOptionsOnly ? this.options : mod.defaults;
        var overrides = isOptionsOnly ? mod : this.options;
        var opts = _.mergeProps({}, defaults, overrides);

        // Compute the effective getMembers function for the new protocol.
        var overrideFunc = mod.override || _.empty;
        var getMems = function (options) {
            var baseMembers = _this._getMembers(options);
            var overrides = overrideFunc(baseMembers, options);
            return _.mergeProps({}, baseMembers, overrides);
        };

        // Return the new protocol.
        return new Protocol(opts, getMems);
    };
    return Protocol;
})();
module.exports = Protocol;
//# sourceMappingURL=protocol.js.map
