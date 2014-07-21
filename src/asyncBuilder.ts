import references = require('references');
import assert = require('assert');
import pipeline = require('./pipeline');
import extensibility = require('./extensibility');
import _ = require('./util');
import Builder = AsyncAwait.Async.Builder;
import Mod = AsyncAwait.Async.Mod;
import Protocol = AsyncAwait.Async.Protocol;
import ProtocolOverrides = AsyncAwait.Async.ProtocolOverrides;
import Coroutine = AsyncAwait.Coroutine;
export = asyncBuilder;


// Bootstrap an initial async builder using a no-op protocol. All methods throw, to assist in protocol debugging.
var asyncBuilder = createAsyncBuilder<Builder>(_.empty, {}, {
    invoke: (co) => { throw new Error('invoke: not supported by this type of suspendable function'); },
    return: (ctx, result) => { throw new Error('return: not supported by this type of suspendable function'); },
    throw: (ctx, error) => { throw new Error('throw: not supported by this type of suspendable function'); },
    yield: (ctx, value) => { throw new Error('yield: not supported by this type of suspendable function'); }
});


/** Creates a new async builder function using the specified protocol settings. */
function createAsyncBuilder<TBuilder extends Builder>(protocolFactory: (baseProtocol: Protocol, options: any) => ProtocolOverrides, options: any, baseProtocol: Protocol) {

    // Instantiate the protocol by calling the provided factory function.
    var protocol: Protocol = <any> _.mergeProps({}, baseProtocol, protocolFactory(baseProtocol, options));

    // Create the builder function.
    var builder: TBuilder = <any> function asyncBuilder(invokee: Function) {

        // Ensure mods are applied on first call to async.
        if (!extensibility.isLocked) extensibility.applyMods();

        // Validate the argument, which is expected to be a closure defining the body of the suspendable function.
        assert(arguments.length === 1, 'async builder: expected a single argument');
        assert(_.isFunction(invokee), 'async builder: expected argument to be a function');

        // Create and return an appropriately configured suspendable function for the given protocol and body.
        return createSuspendableFunction(protocol, invokee);
    };

    // Tack on the protocol and options properties, and the mod() method.
    builder.protocol = protocol;
    builder.options = options;
    builder.mod = createModMethod(protocol, protocolFactory, options, baseProtocol);

    // Return the async builder function.
    return builder;
}


//TODO: review this method! use name? use type? clarity how overrides/defaults are used
/** Creates a mod() method appropriate to the given protocol settings. */
function createModMethod(protocol, protocolFactory, options, baseProtocol) {
    return function mod(mod: Mod<Builder>) {

        // Validate the argument.
        assert(arguments.length === 1, 'mod: expected one argument');
        var hasProtocolFactory = !!mod.overrideProtocol;

        // Determine the appropriate options to pass to createAsyncBuilder.
        var opts = _.branch(extensibility.config());
        _.mergeProps(opts, options, mod.defaultOptions);

        // Determine the appropriate protocolFactory and baseProtocol to pass to createAsyncBuilder.
        var newProtocolFactory = hasProtocolFactory ? mod.overrideProtocol : protocolFactory;
        var newBaseProtocol = hasProtocolFactory ? protocol : baseProtocol;

        // Delegate to createAsyncBuilder to return a new async builder function.
        return createAsyncBuilder(newProtocolFactory, opts, newBaseProtocol);
    }
}


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
var createSuspendableFunction = _.DEBUG ? createSuspendableFunctionDebug : createSuspendableFunctionImpl;
function createSuspendableFunctionImpl(protocol: Protocol, invokee: Function) {

    // Get the formal arity of the invoker and invokee functions.
    var invokerArity = protocol.invoke.length - 1; // Skip the 'co' parameter.
    var invokeeArity = invokee.length;

    // Resolve the second-level cache corresponding to the given invoker arity.
    var cacheLevel2 = suspendableFactoryCache[invokerArity];
    if (!cacheLevel2) {
        cacheLevel2 = [null, null, null, null, null, null, null, null];
        suspendableFactoryCache[invokerArity] = cacheLevel2;
    }

    // Resolve the factory function corresponding to the given invokee arity.
    var suspendableFactory = cacheLevel2[invokeeArity];
    if (!suspendableFactory) {
        suspendableFactory = createSuspendableFactory(invokerArity, invokeeArity);
        cacheLevel2[invokeeArity] = suspendableFactory;
    }

    // Invoke the factory function to obtain an appropriate suspendable function.
    var result = suspendableFactory(protocol, invokee);

    // Return the suspendable function.
    return result;
}


// This is a two-level cache (array of arrays), holding the 'factory' functions
// that are used to create suspendable functions for each invoker/invokee arity.
// The first level is indexed by invoker arity, and the second level by invokee arity.
var suspendableFactoryCache = [null, null, null, null];


/** Create a factory for creating suspendable functions matching the given arities. */
function createSuspendableFactory(invokerArity, invokeeArity) {
    "use strict";

    // Calcluate appropriate values to be substituted into the template.
    var result, funcName = 'SUSP$A' + invokeeArity + '$P' + invokerArity;
    var paramNames = [], invokerArgs = ['co'], invokeeArgs = [];
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
        'result = function factory(protocol, invokee) {',
        '  return function $TEMPLATE($PARAMS) {',
        '    var t = this, l = arguments.length;',
        '    if ((!t || t===global) && l===$ARITY) {',
        '      var body = function f0() { return invokee($INVOKEE_ARGS); };',
        '      var co = pipeline.acquireCoro(protocol, body);',
        '    } else {',
        '      var a = new Array(l-$PN);',
        '      for (var i = 0; i < l-$PN; ++i) a[i] = arguments[i];',
        '      var co = pipeline.acquireCoro(protocol, invokee, t, a);',
        '    }',
        '    return protocol.invoke($INVOKER_ARGS);',
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
                 srcLines[ 7].replace('$PN', invokerArity) +
                 srcLines[ 8].replace('$PN', invokerArity) +
                 srcLines[ 9] +
                 srcLines[10] +
                 srcLines[11].replace('$INVOKER_ARGS', invokerArgs.join(', ')) +
                 srcLines[12] +
                 srcLines[13];

    // Reify and return the factory function.
    eval(source);
    return result;
}


// DEBUG version of createSuspendableFunction(), with no eval.
function createSuspendableFunctionDebug(protocol: Protocol, invokee: Function) {

    // Get the formal arity of the invoker functions
    var invokerArity = protocol.invoke.length - 1; // Skip the 'co' parameter.

    // Return the suspendable function.
    return function SUSP$DEBUG(args) {
        var t = this, l = arguments.length, a = new Array(l - invokerArity);
        for (var i = 0; i < l - invokerArity; ++i) a[i] = arguments[i];
        var co = pipeline.acquireCoro(protocol, invokee, t, a);
        var b = new Array(invokerArity + 1);
        b[0] = co;
        for (var i = 0; i < invokerArity; ++i) b[i + 1] = arguments[l - invokerArity + i];
        return protocol.invoke.apply(null, b);
    }
}
