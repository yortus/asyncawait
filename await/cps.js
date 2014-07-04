var Fiber = require('../src/fibers');
var oldBuilder = require('../src/awaitBuilder');


var builder = oldBuilder.mod(function () {
    return function (expr, resume) {
        if (expr !== void 0)
            return false;
        Fiber.current.resume = resume;
    };
});

//TODO: define the '__' property as an accessor that creates and returns a callback function
Object.defineProperty(builder, '__', {
    get: function () {
        var fiber = Fiber.current;
        return function (err, result) {
            var resume = fiber.resume;
            fiber.resume = null;
            fiber = null;
            resume(err, result);
        };
    }
});
module.exports = builder;
//# sourceMappingURL=cps.js.map
