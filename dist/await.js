var Fiber = require('fibers');

function await(expr) {
    var fiber = Fiber.current;
    expr.then(function (val) {
        return fiber.run(val);
    }, function (err) {
        return fiber.throwInto(err);
    });
    return Fiber.yield();
}
module.exports = await;
