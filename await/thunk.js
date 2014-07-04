var oldBuilder = require('../src/awaitBuilder');

var builder = oldBuilder.mod(function () {
    return function (expr, resume) {
        if (typeof expr !== 'function')
            return false;
        expr(resume);
    };
});
module.exports = builder;
//# sourceMappingURL=thunk.js.map
