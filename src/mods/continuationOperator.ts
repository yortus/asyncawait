import references = require('references');
var cps = require('../../await/cps');
import Mod = AsyncAwait.Mod;
export = continuationOperator;


/**
 * Creates a global property accessor with the given name, which calls
 * await.cps.continuation(). This purely for convenience and clarity
 * for reading and writing async code.
 */
function continuationOperator(identifier: string) {

    // Define the global property accessor.
    Object.defineProperty(global, identifier, { get: cps.continuation });

    // Return an empty object, since we don't alter the pipeline here.
    return (pipeline) => ({});
}
