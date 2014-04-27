var Fiber = require('fibers');

//TODO: jsdoc this API function
function yield_(expr) {
    // Ensure this function is executing inside a fiber.
    if (!Fiber.current) {
        throw new Error('await functions, yield functions, and result-returning suspendable ' + 'functions may only be called from inside a suspendable function. ');
    }

    // Notify waiters of the next result, then suspend the iterator.
    var runContext = Fiber.current.runContext;
    if (runContext.callback)
        runContext.callback(null, { value: expr, done: false });
    if (runContext.resolver)
        runContext.resolver.resolve({ value: expr, done: false });
    Fiber.yield();
}
;
module.exports = yield_;
//# sourceMappingURL=index.js.map
