var _ = require('lodash');
var Protocol = require('./protocols/base');

// Create an abstract async function from which all others can be bootstrapped using mod(...)
var async = makeAsyncFunc({ constructor: Protocol });

/** Creates an async function using the specified protocol. */
function makeAsyncFunc(options) {
    // Parse the protocol options.
    if (!options)
        throw new Error('async(): expected options to be specified');
    var protocolClass = options.constructor;
    if (!protocolClass)
        throw new Error('async(): expected options.constructor to be specified');
    var newProtocol = function () {
        return new protocolClass(options);
    };
    var acceptsCallback = newProtocol().options().acceptsCallback;

    // Create the async function.
    var result = function async(suspendableDefn) {
        // Ensure that a single argument has been supplied, which is a function.
        if (arguments.length !== 1)
            throw new Error('async(): expected a single argument');
        if (!_.isFunction(suspendableDefn))
            throw new Error('async(): expected argument to be a function');

        // The following function is the 'template' for the returned suspendable function.
        function asyncRunner($ARGS) {
            // Copy all passed arguments into a new array.
            var nargs = arguments.length, args = new Array(nargs);
            for (var i = 0; i < nargs; ++i)
                args[i] = arguments[i];

            // Begin execution of the suspendable function definition in a new coroutine.
            var protocol = newProtocol();
            return protocol.invoke(suspendableDefn, this, args);
        }

        // Create the suspendable function from the template function above, giving it the correct arity.
        var result, args = [], arity = suspendableDefn.length + (acceptsCallback ? 1 : 0);
        for (var i = 0; i < arity; ++i)
            args.push('a' + i);
        var funcDefn, funcCode = eval('funcDefn = ' + asyncRunner.toString().replace('$ARGS', args.join(', ')));
        return funcDefn;
    };

    // Tack on the mod(...) method.
    result.mod = function (options_) {
        // Create a new options object with appropriate fallback values.
        var opts = _.assign({ constructor: protocolClass }, options_);

        // Create a new async function from the current one.
        return makeAsyncFunc(opts);
    };
    return result;
}
module.exports = async;
//# sourceMappingURL=asyncBase.js.map
