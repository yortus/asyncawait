import references = require('references');
import assert = require('assert');
import jointProtocol = require('../jointProtocol');
import Mod = AsyncAwait.Mod;
export = cpsKeyword;


/**
 * Creates a global property accessor with the given name, which calls
 * await.cps.continuation(). This is purely for convenience and clarity
 * for reading and writing async code.
 */
var cpsKeyword: Mod = {

    name: 'cpsKeyword',
    
    apply: (options) => {

        // Do nothing if the option is not selected.
        if (!options.cpsKeyword) return;

        // Ensure the symbol is not already defined
        assert(!global[options.cpsKeyword], 'cpsKeyword: identifier already exists on global object');

        // Define the global property accessor.
        _cpsKeyword = options.cpsKeyword;
        Object.defineProperty(global, _cpsKeyword, { get: jointProtocol.continuation, configurable: true });

        // Return an empty object, since we don't alter the jointProtocol here.
        return null;
    },

    reset: () => {
        if (_cpsKeyword) delete global[_cpsKeyword];
        _cpsKeyword = null;
    },

    defaultOptions: {
        cpsKeyword: null
    }
};


// Private keyword state.
//TODO: should this be global, in case multiple asyncawait instances are loaded in the process?
var _cpsKeyword = null;
