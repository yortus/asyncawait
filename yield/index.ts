import references = require('references');
import Fiber = require('fibers');
export = yield_;


function yield_(value?: any) {

    // Ensure this function is executing inside a fiber.
    var fiber = Fiber.current; // TODO: abstract over this - _.getExecutingCoro()
    if (!fiber) throw new Error('yield: may only be called inside a suspendable function.');

    // Delegate to the appropriate protocol's leave method.
    fiber.leave(value);
};
