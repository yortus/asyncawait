var oldBuilder = require('../src/awaitBuilder');

var builder = oldBuilder.mod(function () {
    return function (args, resume) {
        if (args.length !== 1 || typeof args[0] !== 'function')
            return false;
        args[0](resume);
    };
});
module.exports = builder;
//# sourceMappingURL=thunk.js.map
