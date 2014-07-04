var oldBuilder = require('../src/awaitBuilder');


var builder = oldBuilder.mod(function () {
    return function (args, resume) {
        if (args.length !== 1 || !args[0] || typeof args[0].then !== 'function')
            return false;
        args[0].then(function (val) {
            return resume(null, val);
        }, resume);
    };
});
module.exports = builder;
//# sourceMappingURL=promise.js.map
