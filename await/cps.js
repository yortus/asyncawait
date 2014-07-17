var Fiber = require('fibers');
var oldBuilder = require('../src/awaitBuilder');


var builder = oldBuilder.derive(function () {
    return function (co, args) {
        if (args.length !== 1 || args[0] !== void 0)
            return false;
    };
});

builder.continuation = function () {
    var fiber = Fiber.current;
    return function (err, result) {
        fiber.enter(err, result);
        fiber = null;
    };
};
module.exports = builder;
//# sourceMappingURL=cps.js.map
