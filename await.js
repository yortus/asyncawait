var Fiber = require('fibers');

// This is the await() API function (see docs).
// NB: No references to Fiber.current are held in the function. Holding such a
// reference might prevent the fiber from ever being eligible for garbage collection.
function await(expr) {
    // Set up handlers for when expr's promise is resolved or rejected.
    expr.then(function (resolvedValue) {
        // Resume the current fiber only when expr's promise is resolved.
        Fiber.current.run(resolvedValue);
    }, function (rejectionValue) {
        // If expr's promise is rejected, throw an exception in the fiber.
        Fiber.current.throwInto(rejectionValue);
    });

    // Suspend the fiber until either of the above handlers is triggered. Upon resumption,
    // return the resolved value of expr's promise.
    return Fiber.yield();
}
module.exports = await;
