var assert = require('assert');
var Fiber = require('./fibers');

var _ = require('lodash');

// Bootstrap a basic await builder using a no-op handler.
var awaitBuilder = createAwaitBuilder({
    handler: function () {
        return function (expr, resume) {
            return resume(null, expr);
        };
    }
});

/** Create a new await builder function using the specified handler. */
function createAwaitBuilder(protocol) {
    // Obtain the handler.
    var options = protocol;
    var handler = protocol.handler(options);

    // Create the builder function.
    var builder = function await(expr) {
        //TODO: don't assume single arg - pass all through to handler
        // Ensure this function is executing inside a fiber.
        var fiber = Fiber.current;
        if (!fiber) {
            throw new Error('await functions, yield functions, and pseudo-synchronous suspendable ' + 'functions may only be called from inside a suspendable function.');
        }

        // TODO: Execute handler...
        var handlerResult = handler(expr, function (err, result) {
            // TODO: explain...
            if (err)
                setImmediate(function () {
                    return fiber.throwInto(err);
                });
            else
                setImmediate(function () {
                    return fiber.run(result);
                });
        });
        if (handlerResult === false) {
            throw new Error('not handled!');
        }

        // TODO: explain...
        return Fiber.yield();
    };

    // Tack on the mod(...) method.
    builder.mod = function mod(options) {
        // Validate the argument.
        assert(arguments.length === 1, 'mod(): expected a single argument');

        // Create the new protocol to pass to createAwaitBuilder().
        var newProtocol = _.assign({}, protocol, options);
        newProtocol.handler = protocol.handler;
        if (options && _.isFunction(options.handler)) {
            newProtocol.handler = function (opts) {
                return options.handler(opts, handler);
            };
        }

        // Delegate to createAwaitBuilder to return a new await builder function.
        return createAwaitBuilder(newProtocol);
    };

    // Return the await builder function.
    return builder;
}
module.exports = awaitBuilder;
//# sourceMappingURL=awaitBuilder.js.map
