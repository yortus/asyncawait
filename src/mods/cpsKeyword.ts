import references = require('references');
import assert = require('assert');
import _ = require('../util');
import Mod = AsyncAwait.Mod;
export = cpsKeyword;


/**
 * Creates a global property accessor with the given name, which calls
 * await.cps.continuation(). This is purely for convenience and clarity
 * for reading and writing async code.
 */
var cpsKeyword: Mod = {

    name: 'cpsKeyword',

    overrideProtocol: (base, options) => ({
    
        startup: () => {
            base.startup();

            // Delete the previously defined global property accessor, if any.
            if (_cpsKeyword) delete global[_cpsKeyword];

            // TODO:...
            if (!options.cpsKeyword) return;

            // Ensure the symbol is not already defined.
            assert(!global[options.cpsKeyword], 'cpsKeyword: identifier already exists on global object');

            // Define the global property accessor.
            _cpsKeyword = options.cpsKeyword;
            Object.defineProperty(global, _cpsKeyword, { get: _.createContinuation, configurable: true });
        },

        shutdown: () => {

            // Delete the previously defined global property accessor, if any.
            if (_cpsKeyword) delete global[_cpsKeyword];
            _cpsKeyword = null;

            base.shutdown();
        }
    }),

    defaultOptions: {
        cpsKeyword: null
    }
};


// Private keyword state.
//TODO: should this be global, in case multiple asyncawait instances are loaded in the process?
var _cpsKeyword = null;
