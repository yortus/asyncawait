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
    //TODO:...
    var result = function async(suspendable) {
        //TODO:...
        function asyncRunner($ARGS) {
            // Copy all passed arguments into a new array.
            var nargs = arguments.length, args = new Array(nargs);
            for (var i = 0; i < nargs; ++i)
                args[i] = arguments[i];

            // Begin execution of the suspendable function in a coroutine.
            var coro = new coroClass();
            return coro.invoke(suspendable, this, args);
        }

        //TODO:...
        var result, args = [];
        for (var i = 0; i < suspendable.length; ++i)
            args.push('a' + i);
        var funcDefn, funcCode = eval('funcDefn = ' + asyncRunner.toString().replace('$ARGS', args.join(', ')));
        return funcDefn;
    };
    return result;
}
module.exports = async;
//# sourceMappingURL=index.js.map
