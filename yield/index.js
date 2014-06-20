var Fiber = require('../src/fibers');

function yield_(expr) {
    // Ensure this function is executing inside a fiber.
    if (!Fiber.current) {
        throw new Error('await functions, yield functions, and pseudo-synchronous suspendable ' + 'functions may only be called from inside a suspendable function. ');
    }

    Fiber.current.yield(expr);
}
;
module.exports = yield_;
//# sourceMappingURL=index.js.map
