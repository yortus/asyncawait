var assert = require('assert');
var Fiber = require('fibers');
var _ = require('./util');


// Bootstrap a basic await builder using a no-op handler.
var awaitBuilder = createAwaitBuilder(_.empty, {}, function (co, args) {
    return co.enter(null, args[0]);
});

/** Creates a new await builder function using the specified handler settings. */
function createAwaitBuilder(handlerFactory, options, baseHandler) {
    // Instantiate the handler by calling the provided factory function.
    var handler = handlerFactory(options, baseHandler);

    // Create the builder function.
    var builder = function await() {
        //TODO: can this be optimised more, eg like async builder's eval?
        // Ensure this function is executing inside a fiber.
        var fiber = Fiber.current;
        if (!fiber)
            throw new Error('await: may only be called inside a suspendable function.');

        // TODO: explain...
        var len = arguments.length, args = new Array(len);
        for (var i = 0; i < len; ++i)
            args[i] = arguments[i];

        // TODO: Execute handler...
        var handlerResult = handler(fiber.co, args);

        if (handlerResult === false) {
            throw new Error('await: not handled!');
        }

        // TODO: explain...
        return Fiber.yield();
    };

    // Tack on the handler and options properties, and the derive() method.
    builder.handler = handler;
    builder.options = options;
    builder.derive = createDeriveMethod(handler, handlerFactory, options, baseHandler);

    // Return the await builder function.
    return builder;
}

/** Creates a derive method appropriate to the given handler settings. */
function createDeriveMethod(handler, handlerFactory, options, baseHandler) {
    return function mod() {
        // Validate the arguments.
        var len = arguments.length;
        assert(len > 0, 'derive(): expected at least one argument');
        var arg0 = arguments[0], hasHandlerFactory = _.isFunction(arg0);
        assert(hasHandlerFactory || len === 1, 'derive(): invalid argument combination');

        // Determine the appropriate options to pass to createAwaitBuilder.
        var opts = {};
        if (!hasHandlerFactory)
            _.mergeProps(opts, options);
        _.mergeProps(opts, hasHandlerFactory ? arguments[1] : arg0);

        // Determine the appropriate handlerFactory and baseHandler to pass to createAwaitBuilder.
        var newHandlerFactory = hasHandlerFactory ? arg0 : handlerFactory;
        var newBaseHandler = hasHandlerFactory ? handler : baseHandler;

        // Delegate to createAwaitBuilder to return a new async builder function.
        return createAwaitBuilder(newHandlerFactory, opts, newBaseHandler);
    };
}
module.exports = awaitBuilder;
//# sourceMappingURL=awaitBuilder.js.map
