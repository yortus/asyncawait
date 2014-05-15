import references = require('references');
import _ = require('lodash');
import Coro = require('./coro');
import PromiseCoro = require('./patterns/promise');
import NodebackCoro = require('./patterns/nodeback');
import ThunkCoro = require('./patterns/thunk');
import PseudoSyncCoro = require('./patterns/pseudoSync');
import StreamCoro = require('./patterns/stream');
import IterableCoro = require('./patterns/iterable');
import IterableCpsCoro = require('./patterns/iterable.cps');
import IterableThunkCoro = require('./patterns/iterable.thunk');
import IterableResultCoro = require('./patterns/iterable.result');
import ExpressCoro = require('./patterns/express');
export = async;


var async: AsyncAwait.Async = <any> makeAsyncFunc(PromiseCoro);
async.cps = <any> makeAsyncFunc(NodebackCoro);
async.thunk = <any> makeAsyncFunc(ThunkCoro);
async.result = <any> makeAsyncFunc(PseudoSyncCoro);
async.stream = <any> makeAsyncFunc(StreamCoro);
async.iterable = <any> makeAsyncFunc(IterableCoro);
async.iterable.cps = <any> makeAsyncFunc(IterableCpsCoro);
async.iterable.thunk = <any> makeAsyncFunc(IterableThunkCoro);
async.iterable.result = <any> makeAsyncFunc(IterableResultCoro);
async.express = <any> makeAsyncFunc(ExpressCoro);
async.maxConcurrency = Coro.maxConcurrency;


//TODO:...
function makeAsyncFunc(coroClass: AsyncAwait.CoroStatic) {

    // Create and return an async(...) variant that uses the given coroutine class.
    return function async(suspendableDefn: Function) {

        // Ensure that a single argument has been supplied, which is a function.
        if (arguments.length !== 1) throw new Error('async(): expected a single argument');
        if (!_.isFunction(suspendableDefn)) throw new Error('async(): expected argument to be a function');

        // The following function is the 'template' for the returned suspendable function.
        function asyncRunner($ARGS) {

            // Copy all passed arguments into a new array.
            var nargs = arguments.length, args = new Array(nargs);
            for (var i = 0; i < nargs; ++i) args[i] = arguments[i];

            // Begin execution of the suspendable function definition in a coroutine.
            var coro = new coroClass();
            return coro.invoke(suspendableDefn, this, args);
        }

        // Create the suspendable function from the template function above, giving it the correct arity.
        var result, args = [], arity = coroClass.arityFor(suspendableDefn);
        for (var i = 0; i < arity; ++i) args.push('a' + i);
        var funcDefn, funcCode = eval('funcDefn = ' + asyncRunner.toString().replace('$ARGS', args.join(', ')));
        return funcDefn;
    };
}
