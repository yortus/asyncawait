var Fiber = require('../src/fibers');
var oldBuilder = require('../src/awaitBuilder');


var builder = oldBuilder.mod(function () {
    return function (args, resume) {
        if (args.length !== 1 || args[0] !== void 0)
            return false;
        Fiber.current.resume = resume;
    };
});

//TODO: define the '__' property as an accessor that creates and returns a callback function.
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
//TODO: putting stuff on the fiber object - better way??
//# sourceMappingURL=cps.js.map
