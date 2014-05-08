import _refs = require('_refs');
import Coro = require('./coro');
import PromiseCoro = require('./patterns/promise');
import NodebackCoro = require('./patterns/nodeback');
import ThunkCoro = require('./patterns/thunk');
import PseudoSyncCoro = require('./patterns/pseudoSync');
import IterableCoro = require('./patterns/iterable');
export = async;


var async: AsyncAwait.Async = <any> makeAsyncFunc(PromiseCoro);
async.cps = <any> makeAsyncFunc(NodebackCoro);
async.thunk = <any> makeAsyncFunc(ThunkCoro);
async.result = <any> makeAsyncFunc(PseudoSyncCoro);
async.iterable = <any> makeAsyncFunc(IterableCoro);
async.maxConcurrency = Coro.maxConcurrency;


//TODO:...
function makeAsyncFunc(coroClass: new() => AsyncAwait.Coro) {

    //TODO:...
    var result = function async(suspendable: Function) {

        //TODO:...
        function asyncRunner($ARGS) {

            // Copy all passed arguments into a new array.
            var nargs = arguments.length, args = new Array(nargs);
            for (var i = 0; i < nargs; ++i) args[i] = arguments[i];

            // Begin execution of the suspendable function in a coroutine.
            var coro = new coroClass();
            return coro.invoke(suspendable, this, args);
        }

        //TODO:...
        var result, args = [];
        for (var i = 0; i < suspendable.length; ++i) args.push('a' + i);
        var funcDefn, funcCode = eval('funcDefn = ' + asyncRunner.toString().replace('$ARGS', args.join(', ')));
        return funcDefn;
    }
    return result;
}
