var assert = require('assert');
var options = require('./options');


//TODO:...
var ModRegistry = (function () {
    function ModRegistry(_getSeed, _reduce) {
        var _this = this;
        this._getSeed = _getSeed;
        this._reduce = _reduce;
        this._mods = [];
        this._protocols = {};
        //TODO:...
        this._accumulator = _getSeed();

        //TODO:...
        options.on('change', function () {
            // Reset the registry, but retain the list of mods that have been registered.
            var mods = _this._mods;
            _this._mods = [];
            _this._protocols = {};
            _this._accumulator = _getSeed();

            for (var i = 0; i < mods.length; ++i) {
                _this.register(mods[i]);
            }
        });
    }
    ModRegistry.prototype.register = function (mod) {
        // Ensure a mod by this name is not already registered.
        assert(!this._protocols.hasOwnProperty(mod.name), "duplicate registration of mod '" + mod.name + "'");

        // If the mod specifies default values, update the options object now. This will trigger a 'change'
        // event on the options object. The listener above will then reload all previously registered mods.
        if (mod.defaults)
            options.set(mod.defaults, false);

        // Append the mod to the mod list.
        this._mods.push(mod);

        // Find all protocols required by this mod.
        var depNames = mod.requires || [], deps = [];
        for (var i = 0; i < depNames.length; ++i) {
            var depName = depNames[i];
            assert(this._protocols.hasOwnProperty(depName), "mod '" + mod.name + "' requires unknown mod '" + depName + "'");
            deps.push(this._protocols[depName]);
        }

        // Create and save the protocol for this mod, using the current options.
        var protocol = mod.override.apply(null, [options.get()].concat(deps));
        this._protocols[mod.name] = protocol;

        // Apply/incorporate the mod in the client-defined manner.
        this._accumulator = this._reduce(this._accumulator, mod, protocol) || this._accumulator;
    };
    return ModRegistry;
})();
module.exports = ModRegistry;
//# sourceMappingURL=modRegistry.js.map
