import references = require('references');
import assert = require('assert');
import _ = require('lodash');
import noopProtocol = require('./protocols/noop');
import Builder = AsyncAwait.Async.Builder;
import Protocol = AsyncAwait.Async.Protocol;
import ProtocolMethods = AsyncAwait.Async.ProtocolMethods;
import Coroutine = AsyncAwait.Async.Coroutine;
export = asyncBuilder;


// Bootstrap a basic async builder using the noop protocol.
var asyncBuilder = createAsyncBuilder<Builder>(noopProtocol);


/** Create a new async builder function using the specified protocol. */
function createAsyncBuilder<TBuilder extends Builder>(protocol: Protocol) {

    // Obtain the protocol methods.
    var protocolMethods = protocol.methods(protocol);
    var protocolArgCount = protocolMethods.invoke.length - 1;

    // Create the builder function.
    var builder: TBuilder = <any> function asyncBuilder(bodyFunc: Function) {

        // Validate the argument.
        assert(arguments.length === 1, 'async builder: expected a single argument');
        assert(_.isFunction(bodyFunc), 'async builder: expected argument to be a function');

        // The following function is the 'template' for the returned suspendable function.
        function suspendable($ARGS) {

            // Create a coroutine instance to hold context information for this call.
            var co: Coroutine = { protocol: protocolMethods };

            // Distribute arguments between the suspendable function and the protocol's invoke() function.
            // TODO PERF: option for varargs functions and fixed args function (below impl is for varargs, fixed could be made faster).
            var argCount = arguments.length, suspendableArgCount = argCount - protocolArgCount;
            var sArgs = new Array(suspendableArgCount), pArgs = new Array(protocolArgCount + 1);
            pArgs[0] = co;
            for (var i = 0; i < suspendableArgCount; ++i) sArgs[i] = arguments[i];
            for (var i = 0; i < protocolArgCount; ++i) pArgs[i + 1] = arguments[i + suspendableArgCount];

            // Pass execution control over to the protocol.
            co.body = () => bodyFunc.apply(this, sArgs);
            return protocolMethods.invoke.apply(null, pArgs); // TODO: optimise in empty array case
        }

        // Create the suspendable function from the template function above, giving it the correct arity.
        var result, args = [], arity = bodyFunc.length + protocolArgCount;
        for (var i = 0; i < arity; ++i) args.push('a' + i);
        var funcDefn, funcCode = eval('funcDefn = ' + suspendable.toString().replace('$ARGS', args.join(', ')));
        return funcDefn;
    };

    // Tack on the protocol property.
    builder.protocol = protocol;

    // Tack on the mod(...) method.
    builder.mod = <any> function mod(options) {

        // Validate the argument.
        assert(arguments.length === 1, 'mod(): expected a single argument');

        // Create the new protocol to pass to createAsyncBuilder().
        var newProtocol: Protocol = _.assign({}, protocol, options);
        newProtocol.methods = protocol.methods;
        if (options && _.isFunction(options.methods)) {
            newProtocol.methods = (opts) => {
                var newMethods = options.methods(opts, protocolMethods);
                return _.assign({}, protocolMethods, newMethods);
            };
        }

        // Delegate to createAsyncBuilder to return a new async builder function.
        return createAsyncBuilder(newProtocol);
    }

    // Return the async builder function.
    return builder;
}
