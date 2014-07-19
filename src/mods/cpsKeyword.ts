import references = require('references');
var cps = require('../../await/cps');
import Mod = AsyncAwait.Mod;
export = cpsKeyword;


/**
 * Creates a global property accessor with the given name, which calls
 * await.cps.continuation(). This is purely for convenience and clarity
 * for reading and writing async code.
 */
var cpsKeyword: Mod = (pipeline, options) => {

    // Do nothing if the option is not selected.
    var ident = options.cpsKeyword;
    if (!ident) return;

    // Define the global property accessor.
    Object.defineProperty(global, ident, { get: cps.continuation });

    // Return an empty object, since we don't alter the pipeline here.
    return (pipeline) => ({});
};
