import references = require('references');
import assert = require('assert');
import Fiber = require('./fibers');
import Promise = require('bluebird');
import Builder = AsyncAwait.Await.Builder;
import Protocol = AsyncAwait.Await.Protocol;
import Handler = AsyncAwait.Await.Handler;
import _ = require('lodash');
export = awaitBuilder;


// Bootstrap a basic await builder using a no-op handler.
var awaitBuilder = createAwaitBuilder<Builder>({
    handler: () => {
        return (expr, resume) => resume(null, expr)
    }
});


/** Create a new await builder function using the specified handler. */
function createAwaitBuilder<TBuilder extends Builder>(protocol: Protocol) {

    // Obtain the handler.
    var options = protocol; //TODO: explain this...
    var handler = protocol.handler(options);

    // Create the builder function.
    var builder: TBuilder = <any> function await(expr: any) {

        //TODO: don't assume single arg - pass all through to handler

        // Ensure this function is executing inside a fiber.
        var fiber = Fiber.current;
        if (!fiber) {
            throw new Error(
                'await functions, yield functions, and pseudo-synchronous suspendable ' +
                'functions may only be called from inside a suspendable function.'
            );
        }

        // TODO: Execute handler...
        var handlerResult = handler(expr, (err, result) => {

            // TODO: explain...
            if (err) setImmediate(() => fiber.throwInto(err));
            else setImmediate(() => fiber.run(result));
        });
        if (handlerResult === false) { //TODO: explain sentinel value...
            throw new Error('not handled!');
        }

        // TODO: explain...
        return Fiber.yield();
    }

    // Tack on the mod(...) method.
    builder.mod = <any> function mod(options) {

        // Validate the argument.
        assert(arguments.length === 1, 'mod(): expected a single argument');

        // Create the new protocol to pass to createAwaitBuilder().
        var newProtocol: Protocol = _.assign({}, protocol, options);
        newProtocol.handler = protocol.handler;
        if (options && _.isFunction(options.handler)) {
            newProtocol.handler = (opts) => {
                return options.handler(opts, handler);
            };
        }

        // Delegate to createAwaitBuilder to return a new await builder function.
        return createAwaitBuilder(newProtocol);
    }

    // Return the await builder function.
    return builder;
}
