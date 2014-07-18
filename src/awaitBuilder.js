var assert = require('assert');
var pipeline = require('./pipeline');
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
    var builder = function await(arg) {
        //TODO: can this be optimised more, eg like async builder's eval?
        // Ensure this function is executing inside a coroutine.
        var co = pipeline.currentCoro();
        assert(co, 'await: may only be called inside a suspendable function');

        // TODO: temp testing... fast/slow paths
        if (arguments.length === 1) {
            var handlerResult = handler(co, arg);
        } else {
            // Create a new array to hold the passed-in arguments.
            var len = arguments.length, allArgs = new Array(len);
            for (var i = 0; i < len; ++i)
                allArgs[i] = arguments[i];

            // Delegate to the specified handler to appropriately await the pass-in value(s).
            var handlerResult = handler(co, arg, allArgs);
        }

        // Ensure the passed-in value(s) were handled.
        assert(handlerResult !== pipeline.notHandled, 'await: the passed-in value(s) are not recognised as being awaitable.');

        // Suspend the coroutine until the await handler causes it to be resumed.
        return pipeline.suspendCoro();
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
        assert(len > 0, 'derive: expected at least one argument');
        var arg0 = arguments[0], hasHandlerFactory = _.isFunction(arg0);
        assert(hasHandlerFactory || len === 1, 'derive: invalid argument combination');

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
