import references = require('references');
import assert = require('assert');
import pipeline = require('./pipeline');
import _ = require('./util');
import extensibility = require('./extensibility');
import Builder = AsyncAwait.Await.Builder;
import Mod = AsyncAwait.Await.Mod;
import Handler = AsyncAwait.Await.Handler;
export = awaitBuilder;


// Bootstrap a basic await builder using a no-op handler.
var awaitBuilder = createAwaitBuilder<Builder>(_.empty, {}, (co, args) => co.enter(null, args[0]));


/** Creates a new await builder function using the specified handler settings. */
function createAwaitBuilder<TBuilder extends Builder>(handlerFactory: (baseHandler: Handler, options: {}) => Handler, options: {}, baseHandler: Handler) {

    // Instantiate the handler by calling the provided factory function.
    var handler = handlerFactory(baseHandler, options);

    // Create the builder function.
    var builder: TBuilder = <any> function await(arg) {

        //TODO: can this be optimised more, eg like async builder's eval?

        // Ensure this function is executing inside a coroutine.
        var co = pipeline.currentCoro();
        assert(co, 'await: may only be called inside a suspendable function');

        // TODO: temp testing... fast/slow paths
        if (arguments.length === 1) {
            var handlerResult = handler(co, arg);    
        }
        else {

            // Create a new array to hold the passed-in arguments.
            var len = arguments.length, allArgs = new Array(len);
            for (var i = 0; i < len; ++i) allArgs[i] = arguments[i];

            // Delegate to the specified handler to appropriately await the pass-in value(s).
            var handlerResult = handler(co, arg, allArgs);
        }

        // Ensure the passed-in value(s) were handled.
        assert(handlerResult !== pipeline.notHandled, 'await: the passed-in value(s) are not recognised as being awaitable.');

        // Suspend the coroutine until the await handler causes it to be resumed.
        return pipeline.suspendCoro();
    }

    // Tack on the handler and options properties, and the mod() method.
    builder.handler = handler;
    builder.options = options;
    builder.mod = createModMethod(handler, handlerFactory, options, baseHandler);

    // Return the await builder function.
    return builder;
}


//TODO: review this method! use name? use type? clarity how overrides/defaults are used, no more 'factory'
/** Creates a mod() method appropriate to the given handler settings. */
function createModMethod(handler, handlerFactory, options, baseHandler) {
    return function mod(mod: Mod<Builder>) {

        // Validate the argument.
        assert(arguments.length === 1, 'mod: expected one argument');
        var hasHandlerFactory = !!mod.overrideHandler;

        // Determine the appropriate options to pass to createAwaitBuilder.
        var opts = _.branch(extensibility.config());
        _.mergeProps(opts, options, mod.defaultOptions);

        // Determine the appropriate handlerFactory and baseHandler to pass to createAwaitBuilder.
        var newHandlerFactory = hasHandlerFactory ? mod.overrideHandler : handlerFactory;
        var newBaseHandler = hasHandlerFactory ? handler : baseHandler;

        // Delegate to createAwaitBuilder to return a new async builder function.
        return createAwaitBuilder(newHandlerFactory, opts, newBaseHandler);
    }
}
