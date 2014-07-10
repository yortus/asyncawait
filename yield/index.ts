import references = require('references');
import Fiber = require('fibers');
export = yield_;


function yield_(value?: any) {

    // Ensure this function is executing inside a fiber.
    var fiber = Fiber.current;
    if (!fiber) throw new Error('yield: may only be called inside a suspendable function.');

    // Delegate to the appropriate protocol's yield method, via the method attached to the fiber.
    fiber.yield(value);
};
