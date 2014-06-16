import references = require('references');
import _ = require('lodash');
import Protocol = require('./protocols/base');
export = async;


// Create an abstract async function from which all others can be bootstrapped using mod(...)
var async = makeAsyncFunc({ constructor: Protocol });


/** Creates an async function using the specified protocol. */
function makeAsyncFunc<TSuspendable extends AsyncAwait.AsyncFunction>(options: AsyncAwait.ProtocolOptions<TSuspendable>) {

    // Parse the protocol options.
    if (!options) throw new Error('async(): expected options to be specified');
    var protocolClass = options.constructor;
    if (!protocolClass) throw new Error('async(): expected options.constructor to be specified');
    var newProtocol = () => new protocolClass(options);
    var protocolArgCount = newProtocol().invoke.length;

    // Create the async function.
    var result: TSuspendable = <any> function async(suspendableDefn: Function) {

        if (arguments.length !== 1) throw new Error('async(): expected a single argument');
        if (!_.isFunction(suspendableDefn)) throw new Error('async(): expected argument to be a function');

        // The following function is the 'template' for the returned suspendable function.
        function asyncRunner($ARGS) {

            // Distribute arguments between the suspendable function and the protocol's invoke() method
            var argCount = arguments.length, suspendableArgCount = argCount - protocolArgCount;
            var sArgs = new Array(suspendableArgCount), pArgs = new Array(protocolArgCount);
            for (var i = 0; i < suspendableArgCount; ++i) sArgs[i] = arguments[i];
            for (var i = 0; i < protocolArgCount; ++i) pArgs[i] = arguments[i + suspendableArgCount];

            // Begin execution of the suspendable function definition in a new coroutine.
            var invoke = () => suspendableDefn.apply(this, sArgs);
            var protocol = newProtocol();
            protocol['_func'] = invoke; // TODO: temp testing...!!!!
            return protocol.invoke.apply(protocol, pArgs); // TODO: optimise in empty array case
        }

        // Create the suspendable function from the template function above, giving it the correct arity.
        var result, args = [], arity = suspendableDefn.length + protocolArgCount;
        for (var i = 0; i < arity; ++i) args.push('a' + i);
        var funcDefn, funcCode = eval('funcDefn = ' + asyncRunner.toString().replace('$ARGS', args.join(', ')));
        return funcDefn;
    };

    // Tack on the mod(...) method.
    result.mod = function<T extends AsyncAwait.AsyncFunction>(options_: AsyncAwait.ProtocolOptions<T>) {

        // Create a new options object with appropriate fallback values.
        var opts = _.assign({}, options_);
        opts.constructor = opts.constructor || protocolClass;

        // Create a new async function from the current one.
        return makeAsyncFunc(<any> opts);
    }

    // Return the resulting async function.
    return result;
}
