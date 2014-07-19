var cps = require('../../await/cps');


/**
* Creates a global property accessor with the given name, which calls
* await.cps.continuation(). This is purely for convenience and clarity
* for reading and writing async code.
*/
function cpsKeyword(identifier) {
    // Define the global property accessor.
    Object.defineProperty(global, identifier, { get: cps.continuation });

    // Return an empty object, since we don't alter the pipeline here.
    return function (pipeline) {
        return ({});
    };
}
module.exports = cpsKeyword;
//# sourceMappingURL=cpsKeyword.js.map
