import references = require('references');
import assert = require('assert');
import jointProtocol = require('./jointProtocol');
import internalState = require('./config/internalState');
import Protocol = require('./protocol');
import _ = require('./util');
import Builder = AsyncAwait.Async.Builder;
import Mod = AsyncAwait.Async.Mod;
import AsyncProtocol = AsyncAwait.Async.Protocol;
export = asyncBuilder;


/**
 *  Provides the base-level async() function from which all suspendable functions and async mods
 *  may be built. This base-level async() function implements a simple async protocol which:
 *  - implements resume() in terms of Fiber's run() and throwInto().
 *  - implements begin() and end() to just throw, since all protocols must override these.
 *  - implements suspend() to just throw, since yield() must be explicitly supported by a protocol.
 */
var asyncBuilder = createAsyncBuilder({
    override: (base, options) => ({
        begin: (fi) => { throw new Error('begin: not implemented. All async mods must override this method.'); },
        suspend: (fi, error?, value?) => { throw new Error('suspend: not supported by this type of suspendable function'); },
        resume: (fi, error?, value?) => { return error ? fi.throwInto(error) : fi.run(value); },
        end: (fi, error?, value?) => { throw new Error('end: not implemented. All async mods must override this method.'); }
    }),
    defaults: _.branch(internalState.options)
});


/** Creates a new async builder function using the specified mod and protocol settings. */
function createAsyncBuilder(currentMod: Mod, previousProtocol_?: Protocol<any, any>) {

    var previousProtocol = previousProtocol_ || new Protocol({}, () => ({}));
    var currentProtocol = previousProtocol.mod(currentMod);


    // Instantiate the protocol by calling the provided factory function.
    //var protocolOverrides = currentMod.override(previousProtocol, currentMod.defaults);
    //var currentProtocol: Protocol = <any> _.mergeProps({}, previousProtocol, protocolOverrides);

    // Create the builder function.
    var builder: Builder = <any> function asyncBuilder(invokee: Function) {

        // Validate the argument, which is expected to be a closure defining the body of the suspendable function.
        assert(arguments.length === 1, 'async builder: expected a single argument');
        assert(_.isFunction(invokee), 'async builder: expected argument to be a function');

        // Create and return an appropriately configured suspendable function for the given protocol and body.
        return createSuspendableFunction(currentProtocol.members, invokee);
    };

    // Tack on the builder's other properties, and the mod() method.
    builder.mod = (mod: Mod) => createAsyncBuilder(mod, currentProtocol);

    builder.name = null; //TODO:... implement, add all tests, use in error messages
//    builder.mod = createModMethod(currentProtocol, currentMod.defaults, currentMod);

    // Return the async builder function.
    return builder;
}


/** Creates a mod() method appropriate for the given builder. */
//function createModMethod(builderProtocol: Protocol, builderOptions: any, previousMod: Mod) {
//    return function mod(mod: Mod) {

//        // Validate the argument.
//        assert(arguments.length === 1, 'mod: expected one argument');
//        assert(_.isObject(mod), 'mod: expected argument to be an object');
//        var isOptionsOnly = !mod.override;
//        assert(isOptionsOnly || _.isFunction(mod.override), 'mod: expected override to be a function');

//        // Determine the appropriate options to pass to createAsyncBuilder.
////TODO: default options SHOULD NOT override pre-existing options with same keys
////TODO: if isOptionsOnly, then this SHOULD override any existing options
////TODO: see also joint protocol - same thing applies there
//        var override = isOptionsOnly ? previousMod.override : mod.override;
//        var defaults = _.mergeProps(_.branch(builderOptions), isOptionsOnly ? mod : mod.defaults);

//        // Delegate to createAsyncBuilder to return a new async builder function.
//        return createAsyncBuilder({override: override, defaults: defaults}, builderProtocol);
//    }
//}


/**
 *  Creates a suspendable function configured for the given protocol and invokee.
 *  This function is not on the hot path, but the suspendable function it returns
 *  can be hot, so here we trade some time (off the hot path) to make the suspendable
 *  function as fast as possible. This includes safe use of eval (safe because the
 *  input to eval is entirely known and safe). By using eval, the resulting function
 *  can be pieced together more optimally, as well as having the expected arity.
 *  NB: By setting DEBUG (in src/util) to true, a less optimised non-evaled function
 *  will be returned, which is helpful for step-through debugging sessions. However,
 *  this function will not report the correct arity (function.length) in most cases.
 */
var createSuspendableFunction = _.DEBUG ? createDebugSuspendableFunction : createFastSuspendableFunction;
function createFastSuspendableFunction(protocol: AsyncProtocol, invokee: Function) {

    // Get the formal arity of the invoker and invokee functions.
    var invokerArity = protocol.begin.length - 1; // Skip the 'fi' parameter.
    var invokeeArity = invokee.length;

    // From the top-level cache, resolve the second-level cache corresponding to the given invoker arity.
    var cacheLevel1 = cacheOfSuspendableFunctionFactories;
    var cacheLevel2 = cacheLevel1[invokerArity];
    if (!cacheLevel2) {

        // No second-level cache found - preallocate a small one now.
        cacheLevel2 = [null, null, null, null, null, null, null, null];
        cacheLevel1[invokerArity] = cacheLevel2;
    }

    // From the second-level cache, resolve the factory function corresponding to the given invokee arity.
    var suspendableFunctionFactory = cacheLevel2[invokeeArity];
    if (!suspendableFunctionFactory) {

        // No factory function found - create and cache one now.
        suspendableFunctionFactory = createSuspendableFunctionFactory(invokerArity, invokeeArity);
        cacheLevel2[invokeeArity] = suspendableFunctionFactory;
    }

    // Invoke the factory function to obtain an appropriate suspendable function, and return it.
    var suspendableFunction = suspendableFunctionFactory(protocol, invokee);
    return suspendableFunction;
}


// This is a two-level cache (array of arrays), holding the 'factory' functions
// that are used to create suspendable functions for each invoker/invokee arity.
// The first level is indexed by invoker arity, and the second level by invokee arity.
var cacheOfSuspendableFunctionFactories = [null, null, null, null];


/** Creates a factory function for creating suspendable functions matching the given arities. */
function createSuspendableFunctionFactory(invokerArity, invokeeArity) {
    "use strict";

    // Calcluate appropriate values to be substituted into the template.
    var result, funcName = 'SUSP$A' + invokeeArity + '$P' + invokerArity;
    var paramNames = [], invokerArgs = ['fi'], invokeeArgs = [];
    for (var i = 1; i <= invokeeArity; ++i) {
        paramNames.push('A' + i);
        invokeeArgs.push('A' + i);
    }
    for (var i = 1; i <= invokerArity; ++i) {
        paramNames.push('P' + i);
        invokerArgs.push('arguments[l'+ (i - invokerArity - 1) + ']');
    }

    // Create the template for the factory function.
    var srcLines = [
        'result = function factory(asyncProtocol, invokee) {',
        '  return function $TEMPLATE($PARAMS) {',
        '    var t = this, l = arguments.length;',
        '    if ((!t || t===global) && l===$ARITY) {',
        '      var body = function f0() { return invokee($INVOKEE_ARGS); };',
        '      var fi = jointProtocol.acquireFiber(asyncProtocol);',
        '      jointProtocol.setFiberTarget(fi, body);',
        '    } else {',
        '      var a = new Array(l-$PN);',
        '      for (var i = 0; i < l-$PN; ++i) a[i] = arguments[i];',
        '      var fi = jointProtocol.acquireFiber(asyncProtocol);',
        '      jointProtocol.setFiberTarget(fi, invokee, t, a);',
        '    }',
        '    return asyncProtocol.begin($INVOKER_ARGS);',
        '  }',
        '}'
    ];

    // Substitute values into the template to obtain the final source code.
    var source = srcLines[ 0] +
                 srcLines[ 1].replace('$TEMPLATE', funcName).replace('$PARAMS', paramNames.join(', ')) +
                 srcLines[ 2] +
                 srcLines[ 3].replace('$ARITY', '' + paramNames.length) +
                 srcLines[ 4].replace('$INVOKEE_ARGS', invokeeArgs.join(', ')) +
                 srcLines[ 5] +
                 srcLines[ 6] +
                 srcLines[ 7] +
                 srcLines[ 8].replace('$PN', invokerArity) +
                 srcLines[ 9].replace('$PN', invokerArity) +
                 srcLines[10] +
                 srcLines[11] +
                 srcLines[12] +
                 srcLines[13].replace('$INVOKER_ARGS', invokerArgs.join(', ')) +
                 srcLines[14] +
                 srcLines[15];

    // Reify and return the factory function.
    eval(source);
    return result;
}


// DEBUG version of createSuspendableFunction(), with no eval.
function createDebugSuspendableFunction(asyncProtocol: AsyncProtocol, invokee: Function) {

    // Get the formal arity of the invoker function.
    var invokerArity = asyncProtocol.begin.length - 1; // Skip the 'fi' parameter.

    // Return the suspendable function.
    return function SUSP$DEBUG(args) {
        var t = this, l = arguments.length, a = new Array(l - invokerArity);
        for (var i = 0; i < l - invokerArity; ++i) a[i] = arguments[i];
        var fi = jointProtocol.acquireFiber(asyncProtocol);
        jointProtocol.setFiberTarget(fi, invokee, t, a);
        var b = new Array(invokerArity + 1);
        b[0] = fi;
        for (var i = 0; i < invokerArity; ++i) b[i + 1] = arguments[l - invokerArity + i];
        return asyncProtocol.begin.apply(null, b);
    }
}
