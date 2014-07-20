var cps = require('../../await/cps');


/**
* Creates a global property accessor with the given name, which calls
* await.cps.continuation(). This is purely for convenience and clarity
* for reading and writing async code.
*/
var cpsKeyword = {
    apply: function (pipeline, options) {
        // Do nothing if the option is not selected.
        _cpsKeyword = options.cpsKeyword;
        if (!_cpsKeyword)
            return;

        // Define the global property accessor.
        Object.defineProperty(global, _cpsKeyword, { get: cps.continuation });

        // Return an empty object, since we don't alter the pipeline here.
        return null;
    },
    reset: function () {
        if (_cpsKeyword)
            delete global[_cpsKeyword];
        _cpsKeyword = null;
    },
    defaults: {
        cpsKeyword: null
    }
};

// Private keyword state.
//TODO: should this be global, in case multiple asyncawait instances are loaded in the process?
var _cpsKeyword = null;
module.exports = cpsKeyword;
//# sourceMappingURL=cpsKeyword.js.map
