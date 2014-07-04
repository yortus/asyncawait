import references = require('references');
import assert = require('assert');
import Fiber = require('./fibers');
import _ = require('./util');
import Builder = AsyncAwait.Await.Builder;
import Handler = AsyncAwait.Await.Handler;
export = awaitBuilder;


// Bootstrap a basic await builder using a no-op handler.
var awaitBuilder = createAwaitBuilder<Builder>(_.empty, {}, (args, resume) => resume(null, args[0]));


/** Create a new await builder function using the specified handler settings. */
function createAwaitBuilder<TBuilder extends Builder>(handlerFactory: (options: {}, baseHandler: Handler) => Handler, options: {}, baseHandler: Handler) {

    // Instantiate the handler by calling the provided factory function.
    var handler = handlerFactory(options, baseHandler);

    // Create the builder function.
    var builder: TBuilder = <any> function await() {

        //TODO: can this be optimised more, eg like async builder's eval?

        // Ensure this function is executing inside a fiber.
        var fiber = Fiber.current;
        if (!fiber) {
            //TODO: improve message below...
            throw new Error(
                'await functions, yield functions, and pseudo-synchronous suspendable ' +
                'functions may only be called from inside a suspendable function.'
            );
        }

        // TODO: Execute handler...
        var len = arguments.length, args = new Array(len);
        for (var i = 0; i < len; ++i) args[i] = arguments[i];
        var handlerResult = handler(args, (err, result) => {

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

    // Tack on the handler and options properties, and the mod() method.
    builder.handler = handler;
    builder.options = options;
    builder.mod = createModMethod(handler, handlerFactory, options, baseHandler);

    // Return the await builder function.
    return builder;
}


/** Create a mod method appropriate to the given handler settings. */
function createModMethod(handler, handlerFactory, options, baseHandler) {
    return function mod() {

        // Validate the arguments.
        var len = arguments.length;
        assert(len > 0, 'mod(): expected at least one argument');
        var arg0 = arguments[0], hasHandlerFactory = _.isFunction(arg0);
        assert(hasHandlerFactory || len === 1, 'mod(): invalid argument combination');

        // Determine the appropriate options to pass to createAwaitBuilder.
        var opts = {};
        if (!hasHandlerFactory) _.mergeProps(opts, options);
        _.mergeProps(opts, hasHandlerFactory ? arguments[1] : arg0);

        // Determine the appropriate handlerFactory and baseHandler to pass to createAwaitBuilder.
        var newHandlerFactory = hasHandlerFactory ? arg0 : handlerFactory;
        var newBaseHandler = hasHandlerFactory ? handler : baseHandler;

        // Delegate to createAwaitBuilder to return a new async builder function.
        return createAwaitBuilder(newHandlerFactory, opts, newBaseHandler);
    }
}
