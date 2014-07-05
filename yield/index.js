var Fiber = require('../src/fibers');

function yield_(value) {
    // Ensure this function is executing inside a fiber.
    var fiber = Fiber.current;
    if (!fiber)
        throw new Error('yield: may only be called inside a suspendable function.');

    // Delegate to the appropriate protocol's yield method, via the method attached to the fiber.
    fiber.yield(value);
}
;
module.exports = yield_;
//# sourceMappingURL=index.js.map
