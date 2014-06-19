import references = require('references');
import _ = require('lodash');
import Builder = AsyncAwait.Async.Builder;
import Protocol = AsyncAwait.Async.Protocol;
import Coroutine = AsyncAwait.Async.Coroutine;
export = createAsyncBuilder;


// TODO: doc...
function makeNullProtocol() {
    return {
        invoke: (co) => { },
        return: (co, result) => { },
        throw: (co, error) => { },
        yield: (co, value) => { },
        finally: (co) => { }
    };
}


/** Creates an async builder function using the specified protocol. */
function createAsyncBuilder<TBuilder extends Builder>(protocol_?: Protocol) {

    // Parse the protocol.
    var protocol = <Protocol> _.assign(makeNullProtocol(), protocol_);
    var protocolArgCount = protocol.invoke.length - 1;

    // Create the builder function.
    var builder: TBuilder = <any> function asyncBuilder(bodyFunc: Function) {

        if (arguments.length !== 1) throw new Error('async builder: expected a single argument');
        if (!_.isFunction(bodyFunc)) throw new Error('async builder: expected argument to be a function');

        // The following function is the 'template' for the returned suspendable function.
        function suspendable($ARGS) {

            // Create a coroutine instance to hold context information for this call.
            var co: Coroutine = { protocol: protocol };

            // Distribute arguments between the suspendable function and the protocol's invoke() method.
            // TODO PERF: option for varargs functions and fixed args function (below impl is for varargs, fixed could be made faster)
            var argCount = arguments.length, suspendableArgCount = argCount - protocolArgCount;
            var sArgs = new Array(suspendableArgCount), pArgs = new Array(protocolArgCount + 1);
            pArgs[0] = co;
            for (var i = 0; i < suspendableArgCount; ++i) sArgs[i] = arguments[i];
            for (var i = 0; i < protocolArgCount; ++i) pArgs[i + 1] = arguments[i + suspendableArgCount];

            // Pass execution control over to the protocol.
            co.body = () => bodyFunc.apply(this, sArgs);
            return protocol.invoke.apply(null, pArgs); // TODO: optimise in empty array case
        }

        // Create the suspendable function from the template function above, giving it the correct arity.
        var result, args = [], arity = bodyFunc.length + protocolArgCount;
        for (var i = 0; i < arity; ++i) args.push('a' + i);
        var funcDefn, funcCode = eval('funcDefn = ' + suspendable.toString().replace('$ARGS', args.join(', ')));
        return funcDefn;
    };

    // Tack on the mod(...) method.
    builder.mod = <any> function mod(protocol_?: Protocol) {

        // If called without arguments, return a copy of the protocol in use.
        if (!protocol) return _.assign({}, protocol);

        // Delegate to createAsyncBuilder to return a new async builder function.
        return createAsyncBuilder(protocol_);
    }

    // Return the async builder function.
    return builder;
}
