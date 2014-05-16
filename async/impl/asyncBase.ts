import references = require('references');
import _ = require('lodash');
import Protocol = require('./protocols/base');
export = async;


//TODO:... testing...
var async = makeAsyncFunc(Protocol);







//TODO:...
function makeAsyncFunc<TSuspendable extends AsyncAwait.Suspendable>(protocolClass: AsyncAwait.ProtocolStatic<TSuspendable>) {

    // Create and return an async(...) variant that uses the given coroutine class.
    var result: TSuspendable = <any> function async(suspendableDefn: Function) {

        // Ensure that a single argument has been supplied, which is a function.
        if (arguments.length !== 1) throw new Error('async(): expected a single argument');
        if (!_.isFunction(suspendableDefn)) throw new Error('async(): expected argument to be a function');

        // The following function is the 'template' for the returned suspendable function.
        function asyncRunner($ARGS) {

            // Copy all passed arguments into a new array.
            var nargs = arguments.length, args = new Array(nargs);
            for (var i = 0; i < nargs; ++i) args[i] = arguments[i];

            // Begin execution of the suspendable function definition in a coroutine.
            var protocol = new protocolClass();
            return protocol.invoke(suspendableDefn, this, args);
        }

        // Create the suspendable function from the template function above, giving it the correct arity.
        var result, args = [], arity = suspendableDefn.length + (protocolClass.acceptsCallback ? 1 : 0);
        for (var i = 0; i < arity; ++i) args.push('a' + i);
        var funcDefn, funcCode = eval('funcDefn = ' + asyncRunner.toString().replace('$ARGS', args.join(', ')));
        return funcDefn;
    };



    //TODO:...
    result.protocol = protocolClass;
    result.mod = function(options) {

        // Create a new async function from the current one
        var protocol = options.protocol;
        if (_.isFunction(protocol)) {
            var result = makeAsyncFunc(protocol);
        } else if (_.isObject(protocol)) {

            //TODO:... create derived class
            result = null;


        } else {
            throw new Error('mod(): Expected a constructor function or an object');
        }

        return result;
    }
    return result;
}
