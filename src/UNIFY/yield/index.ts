import _refs = require('_refs');
import Fiber = require('fibers');
export = yield_;


function yield_(expr) {

    // Ensure this function is executing inside a fiber.
    if (!Fiber.current) {
        throw new Error(
            'await functions, yield functions, and pseudo-synchronous suspendable ' +
            'functions may only be called from inside a suspendable function. '
        );
    }

    Fiber.current.yield(expr);
};
