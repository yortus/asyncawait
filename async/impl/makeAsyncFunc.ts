import _ = require('lodash');
export = makeAsyncFunc;


//TODO:...
function makeAsyncFunc(protocolClass: AsyncAwait.ProtocolStatic) {

    // Create and return an async(...) variant that uses the given coroutine class.
    var result: AsyncAwait.AsyncFunction = <any> function async(suspendableDefn: Function) {

        // Ensure that a single argument has been supplied, which is a function.
        if (arguments.length !== 1) throw new Error('async(): expected a single argument');
        if (!_.isFunction(suspendableDefn)) throw new Error('async(): expected argument to be a function');

        // The following function is the 'template' for the returned suspendable function.
        function asyncRunner($ARGS) {

            // Copy all passed arguments into a new array.
            var nargs = arguments.length, args = new Array(nargs);
            for (var i = 0; i < nargs; ++i) args[i] = arguments[i];

            // Begin execution of the suspendable function definition in a coroutine.
            var coro = new protocolClass();
            return coro.invoke(suspendableDefn, this, args);
        }

        // Create the suspendable function from the template function above, giving it the correct arity.
        var result, args = [], arity = protocolClass.arityFor(suspendableDefn);
        for (var i = 0; i < arity; ++i) args.push('a' + i);
        var funcDefn, funcCode = eval('funcDefn = ' + asyncRunner.toString().replace('$ARGS', args.join(', ')));
        return funcDefn;
    };



    //TODO:...
    result.protocol = protocolClass;
    result.mod = function(options) {
        throw new Error('Not implemented!');
        return null;
    }
    return result;
}
