var Fiber = require('../src/fibers');
var builder = require('../src/awaitBuilder');

var cpsHandler = function (expr, resume) {
    if (expr !== void 0)
        return false;
    Fiber.current.resume = resume;
};

var api = builder.createAwaitBuilder(cpsHandler);
api.contd = function () {
    var fiber = Fiber.current;
    return function (err, result) {
        var resume = fiber.resume;
        fiber.resume = null;
        fiber = null;
        resume(err, result);
    };
};
module.exports = api;
//# sourceMappingURL=cps.js.map
