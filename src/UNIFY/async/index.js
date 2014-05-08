var _ = require('lodash');
var Coro = require('./coro');
var PromiseCoro = require('./patterns/promise');
var NodebackCoro = require('./patterns/nodeback');
var ThunkCoro = require('./patterns/thunk');
var PseudoSyncCoro = require('./patterns/pseudoSync');
var IterableCoro = require('./patterns/iterable');

var async = makeAsyncFunc(PromiseCoro);
async.cps = makeAsyncFunc(NodebackCoro);
async.thunk = makeAsyncFunc(ThunkCoro);
async.result = makeAsyncFunc(PseudoSyncCoro);
async.iterable = makeAsyncFunc(IterableCoro);
async.maxConcurrency = Coro.maxConcurrency;

//TODO:...
function makeAsyncFunc(coroClass) {
    // Create and return an async(...) variant that uses the given coroutine class.
    return function async(suspendableDefn) {
        // Ensure that a single argument has been supplied, which is a function.
        if (arguments.length !== 1)
            throw new Error('async(): expected a single argument');
        if (!_.isFunction(suspendableDefn))
            throw new Error('async(): expected a function as its argument');

        // The following function is the 'template' for the returned suspendable function.
        function asyncRunner($ARGS) {
            // Copy all passed arguments into a new array.
            var nargs = arguments.length, args = new Array(nargs);
            for (var i = 0; i < nargs; ++i)
                args[i] = arguments[i];

            // Begin execution of the suspendable function definition in a coroutine.
            var coro = new coroClass();
            return coro.invoke(suspendableDefn, this, args);
        }

        // Create the suspendable function from the template function above, giving it the correct arity.
        var result, args = [];
        for (var i = 0; i < suspendableDefn.length; ++i)
            args.push('a' + i);
        var funcDefn, funcCode = eval('funcDefn = ' + asyncRunner.toString().replace('$ARGS', args.join(', ')));
        return funcDefn;
    };
}
module.exports = async;
//# sourceMappingURL=index.js.map
