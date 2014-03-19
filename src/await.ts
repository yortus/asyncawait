import _refs = require('_refs');
import Fiber = require('fibers');
export = await;


function await<T>(expr: AsyncAwait.Thenable<T>): T {
    var fiber = Fiber.current;
    expr.then(val => fiber.run(val), err => fiber.throwInto(err));
    return Fiber.yield();
}
