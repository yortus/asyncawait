import references = require('references');
import assert = require('assert');
import _ = require('lodash');
import Builder = AsyncAwait.Async.Builder;
import Protocol = AsyncAwait.Async.Protocol;
import ProtocolMethods = AsyncAwait.Async.ProtocolMethods;
import Coroutine = AsyncAwait.Async.Coroutine;
export = asyncBuilder;


// Bootstrap a basic async builder using a no-op protocol.
var asyncBuilder = createAsyncBuilder<Builder>({
    methods: () => ({
        invoke: (co) => { },
        return: (co, result) => { },
        throw: (co, error) => { },
        yield: (co, value) => { },
        finally: (co) => { }
    })
});


/** Create a new async builder function using the specified protocol. */
function createAsyncBuilder<TBuilder extends Builder>(protocol: Protocol) {

    // Obtain the protocol methods.
    var options = protocol; //TODO: explain this...
    var protocolMethods = protocol.methods(options);
    var protocolArgCount = protocolMethods.invoke.length - 1;

    // Create the builder function.
    var builder: TBuilder = <any> function asyncBuilder(bodyFunc: Function) {

        // Validate the argument.
        assert(arguments.length === 1, 'async builder: expected a single argument');
        assert(_.isFunction(bodyFunc), 'async builder: expected argument to be a function');

        // Create the suspendable function from the template function above, giving it the correct arity.
        var result, args = [], arity = bodyFunc.length + protocolArgCount;
        for (var i = 0; i < arity; ++i) args.push('a' + i);
        var funcSource = suspendableSource
            .replace('$ARGS', args.join(', '))
            .replace('$ARGCOUNT', '' + args.length)
            .replace('$FASTPATH',
                'var co = new Object(), self = this;' +
                'co.protocol = protocolMethods;' +
                'co.body = function () { return bodyFunc.call(self' + (bodyFunc.length ? ', ' + args.slice(0, bodyFunc.length).join(', ') : '') + '); };' +
                //TODO: perf option (no preserve "this"): 'co.body = function () { return bodyFunc(' + args.slice(0, bodyFunc.length).join(', ') + '); };' +
                'return protocolMethods.invoke(co' + (protocolArgCount ? ', ' + args.slice(bodyFunc.length).join(', ') : '') + ');'
            );
        return createSuspendableFunc(funcSource, protocolArgCount, protocolMethods, bodyFunc);
    };

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





//TODO:...
var suspendableSource = (() => {

    //TODO:...
    var protocolArgCount, protocolMethods, bodyFunc, $ARGCOUNT, $FASTPATH;

    // The following function is the 'template' for the returned suspendable function.
    function suspendable($ARGS) {
        if (arguments.length === $ARGCOUNT) {
            $FASTPATH
        }

        // Distribute arguments between the suspendable function and the protocol's invoke() function.
        var argCount = arguments.length, suspendableArgCount = argCount - protocolArgCount;
        var sArgs = new Array(suspendableArgCount), pArgs = new Array(protocolArgCount + 1);
        for (var i = 0; i < suspendableArgCount; ++i) sArgs[i] = arguments[i];
        for (var i = 0; i < protocolArgCount; ++i) pArgs[i + 1] = arguments[i + suspendableArgCount];

        // Create a coroutine instance to hold context information for this call.
        var co: Coroutine = <any> new Object();
        co.protocol = protocolMethods;
        co.body = () => bodyFunc.apply(this, sArgs);
        pArgs[0] = co;

        // Pass execution control over to the protocol.
        return protocolMethods.invoke.apply(null, pArgs); // TODO: optimise in empty array case
    }

    //TODO:...
    return suspendable.toString();
})();


//TODO:...
function createSuspendableFunc(source, protocolArgCount, protocolMethods, bodyFunc) {
    var funcDefn;
    var funcCode = eval('funcDefn = ' + source);
    return funcDefn;
}
