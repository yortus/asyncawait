import _refs = require('_refs');
import Fiber = require('fibers');
export = await;


// This is the await() API function (see docs).
function await<T>(expr: AsyncAwait.Thenable<T>): T {
    var fiber = Fiber.current;

    // Set up handlers for when expr's promise is resolved or rejected.
    expr.then(
        resolvedValue => {

            // Resume the current fiber only when expr's promise is resolved.
            fiber.run(resolvedValue);
        },
        rejectionValue => {

            // If expr's promise is rejected, throw an exception in the fiber.
            fiber.throwInto(rejectionValue);
        }
    );

    // Suspend the fiber until either of the above handlers is triggered. Upon resumption,
    // return the resolved value of expr's promise.
    return Fiber.yield();
}
