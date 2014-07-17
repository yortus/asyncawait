var Fiber = require('fibers');

function yield_(value) {
    // Ensure this function is executing inside a fiber.
    var fiber = Fiber.current;
    if (!fiber)
        throw new Error('yield: may only be called inside a suspendable function.');

    // Delegate to the appropriate protocol's leave method.
    fiber.leave(value);
}
;
module.exports = yield_;
//# sourceMappingURL=index.js.map
