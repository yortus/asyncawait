import references = require('references');
import startup = require('../src/startup');
import _ = require('../src/util');
export = yield_;


//TODO: testing...
startup.go();


var yield_: AsyncAwait.Yield = <any> function yield_(value?: any) {

    // Ensure this function is executing inside a fiber.
    var fi = _.currentFiber();
    if (!fi) throw new Error('yield: may only be called inside a suspendable function.');

    // Delegate to the appropriate protocol-specific behaviour.
    fi.suspend(null, value);
};
