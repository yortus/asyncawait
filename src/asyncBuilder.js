var assert = require('assert');
var jointProtocol = require('./pipeline');
var extensibility = require('./extensibility');
var _ = require('./util');


// TODO: change co to fi throughout and use correct type (Fiber/FiberEx)
// Bootstrap an initial async builder using the base protocol. The base protocol:
// - implements resume() in terms of Fiber's run() and throwInto().
// - implements begin() and end() to just throw, since all protocols must override these.
// - implements suspend() to just throw, since yield() must be explicitly supported by a protocol.
var asyncBuilder = createAsyncBuilder({}, {
    overrideProtocol: function (base, options) {
        return ({
            begin: function (fi) {
                throw new Error('begin: not implemented. All async mods must override this method.');
            },
            suspend: function (fi, error, value) {
                throw new Error('suspend: not supported by this type of suspendable function');
            },
            resume: function (fi, error, value) {
                return error ? fi.throwInto(error) : fi.run(value);
            },
            end: function (fi, error, value) {
                throw new Error('end: not implemented. All async mods must override this method.');
            }
        });
    }
});

/** Creates a new async builder function using the specified protocol settings. */
function createAsyncBuilder(baseProtocol, mod) {
    // Instantiate the protocol by calling the provided factory function.
    var protocol = _.mergeProps({}, baseProtocol, mod.overrideProtocol(baseProtocol, mod.defaultOptions));

    // Create the builder function.
    var builder = function asyncBuilder(invokee) {
        // Ensure mods are applied on first call to async.
        if (!extensibility.isLocked)
            extensibility.applyMods();

        // Validate the argument, which is expected to be a closure defining the body of the suspendable function.
        assert(arguments.length === 1, 'async builder: expected a single argument');
        assert(_.isFunction(invokee), 'async builder: expected argument to be a function');

        // Create and return an appropriately configured suspendable function for the given protocol and body.
        return createSuspendableFunction(protocol, invokee);
    };

    // Tack on the builder's other properties, and the mod() method.
    builder.name = null; //TODO:... implement, add all tests, use in error messages
    builder.protocol = protocol;
    builder.options = mod.defaultOptions;
    builder.mod = createModMethod(protocol, mod.overrideProtocol, mod.defaultOptions, baseProtocol);

    // Return the async builder function.
    return builder;
}

//TODO: review this method! use name? use type? clarity how overrides/defaults are used, no more 'factory'
/** Creates a mod() method appropriate to the given protocol settings. */
function createModMethod(protocol, getProtocolOverrides, options, baseProtocol) {
    return function mod(mod) {
        // Validate the argument.
        assert(arguments.length === 1, 'mod: expected one argument');
        var isOptionsOnly = !mod.overrideProtocol;

        // Determine the appropriate options to pass to createAsyncBuilder.
        var opts = _.branch(extensibility.config());
        _.mergeProps(opts, options, isOptionsOnly ? mod : mod.defaultOptions);

        // Determine the appropriate protocolFactory and baseProtocol to pass to createAsyncBuilder.
        var newGetProtocolOverrides = isOptionsOnly ? getProtocolOverrides : mod.overrideProtocol;
        var newBaseProtocol = isOptionsOnly ? baseProtocol : protocol;

        // Delegate to createAsyncBuilder to return a new async builder function.
        var newMod = {
            overrideProtocol: newGetProtocolOverrides,
            defaultOptions: opts
        };
        return createAsyncBuilder(newBaseProtocol, newMod);
    };
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
function createSuspendableFunctionImpl(protocol, invokee) {
    // Get the formal arity of the invoker and invokee functions.
    var invokerArity = protocol.begin.length - 1;
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
        invokerArgs.push('arguments[l' + (i - invokerArity - 1) + ']');
    }

    // Create the template for the factory function.
    var srcLines = [
        'result = function factory(asyncProtocol, invokee) {',
        '  return function $TEMPLATE($PARAMS) {',
        '    var t = this, l = arguments.length;',
        '    if ((!t || t===global) && l===$ARITY) {',
        '      var body = function f0() { return invokee($INVOKEE_ARGS); };',
        '      var co = jointProtocol.acquireCoro(asyncProtocol, body);',
        '    } else {',
        '      var a = new Array(l-$PN);',
        '      for (var i = 0; i < l-$PN; ++i) a[i] = arguments[i];',
        '      var co = jointProtocol.acquireCoro(asyncProtocol, invokee, t, a);',
        '    }',
        '    return asyncProtocol.begin($INVOKER_ARGS);',
        '  }',
        '}'
    ];

    // Substitute values into the template to obtain the final source code.
    var source = srcLines[0] + srcLines[1].replace('$TEMPLATE', funcName).replace('$PARAMS', paramNames.join(', ')) + srcLines[2] + srcLines[3].replace('$ARITY', '' + paramNames.length) + srcLines[4].replace('$INVOKEE_ARGS', invokeeArgs.join(', ')) + srcLines[5] + srcLines[6] + srcLines[7].replace('$PN', invokerArity) + srcLines[8].replace('$PN', invokerArity) + srcLines[9] + srcLines[10] + srcLines[11].replace('$INVOKER_ARGS', invokerArgs.join(', ')) + srcLines[12] + srcLines[13];

    // Reify and return the factory function.
    eval(source);
    return result;
}

// DEBUG version of createSuspendableFunction(), with no eval.
function createSuspendableFunctionDebug(asyncProtocol, invokee) {
    // Get the formal arity of the invoker functions
    var invokerArity = asyncProtocol.begin.length - 1;

    // Return the suspendable function.
    return function SUSP$DEBUG(args) {
        var t = this, l = arguments.length, a = new Array(l - invokerArity);
        for (var i = 0; i < l - invokerArity; ++i)
            a[i] = arguments[i];
        var co = jointProtocol.acquireCoro(asyncProtocol, invokee, t, a);
        var b = new Array(invokerArity + 1);
        b[0] = co;
        for (var i = 0; i < invokerArity; ++i)
            b[i + 1] = arguments[l - invokerArity + i];
        return asyncProtocol.begin.apply(null, b);
    };
}
module.exports = asyncBuilder;
//# sourceMappingURL=asyncBuilder.js.map
