import references = require('references');
import assert = require('assert');
import _ = require('./util');
import Mod = AsyncAwait.Mod2;
export = Protocol;


class Protocol<TMembers, TOptions> {

    constructor(options: TOptions, getMembers: (options: TOptions) => TMembers) {
        this.options = options;
        this.members = getMembers(options);
        this._getMembers = getMembers;
    }

    options: TOptions;

    members: TMembers;

    mod(mod: any) {

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
        var getMems = (options) => {
            var baseMembers = this._getMembers(options);
            var overrides = overrideFunc(baseMembers, options);
            return _.mergeProps({}, baseMembers, overrides);
        }

        // Return the new protocol.
        return new Protocol(opts, getMems);
    }

    private _getMembers: (options: TOptions) => TMembers;
}
