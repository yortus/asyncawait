var Fiber = require('fibers');

// This is the await() API function (see docs).
function await(expr) {
    var fiber = Fiber.current;

    // Set up handlers for when expr's promise is resolved or rejected.
    expr.then(function (resolvedValue) {
        // Resume the current fiber only when expr's promise is resolved.
        fiber.run(resolvedValue);
    }, function (rejectionValue) {
        // If expr's promise is rejected, throw an exception in the fiber.
        fiber.throwInto(rejectionValue);
    });

    // Suspend the fiber until either of the above handlers is triggered. Upon resumption,
    // return the resolved value of expr's promise.
    return Fiber.yield();
}
module.exports = await;
