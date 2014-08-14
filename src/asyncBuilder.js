var assert = require('assert');
var jointProtocol = require('./jointProtocol');
var config = require('./config/index');
var Protocol = require('./protocol');
var _ = require('./util');


/**
*  Provides the base-level async() function from which all suspendable functions and async mods
*  may be built. This base-level async() function implements a simple async protocol which:
*  - implements resume() in terms of Fiber's run() and throwInto().
*  - implements begin() and end() to just throw, since all protocols must override these.
*  - implements suspend() to just throw, since yield() must be explicitly supported by a protocol.
*/
var asyncBuilder = createAsyncBuilder(new Protocol(_.branch(config.options()), function () {
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
}));

/** Creates a new async builder function using the specified mod and protocol settings. */
function createAsyncBuilder(protocol) {
    // Create the builder function.
    var builder = function asyncBuilder(invokee) {
        // Validate the argument, which is expected to be a closure defining the body of the suspendable function.
        assert(arguments.length === 1, 'async builder: expected a single argument');
        assert(_.isFunction(invokee), 'async builder: expected argument to be a function');

        // Create and return an appropriately configured suspendable function for the given protocol and body.
        return createSuspendableFunction(protocol.members, invokee);
    };

    // Tack on the builder's other properties, and the mod() method.
    builder.name = null; //TODO:... implement, add all tests, use in error messages
    builder.mod = function (mod) {
        return createAsyncBuilder(protocol.mod(mod));
    };

    // Return the async builder function.
    return builder;
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
var createSuspendableFunction = _.DEBUG ? createDebugSuspendableFunction : createFastSuspendableFunction;
function createFastSuspendableFunction(protocol, invokee) {
    // Get the formal arity of the invoker and invokee functions.
    var invokerArity = protocol.begin.length - 1;
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
        invokerArgs.push('arguments[l' + (i - invokerArity - 1) + ']');
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
    var source = srcLines[0] + srcLines[1].replace('$TEMPLATE', funcName).replace('$PARAMS', paramNames.join(', ')) + srcLines[2] + srcLines[3].replace('$ARITY', '' + paramNames.length) + srcLines[4].replace('$INVOKEE_ARGS', invokeeArgs.join(', ')) + srcLines[5] + srcLines[6] + srcLines[7] + srcLines[8].replace('$PN', invokerArity) + srcLines[9].replace('$PN', invokerArity) + srcLines[10] + srcLines[11] + srcLines[12] + srcLines[13].replace('$INVOKER_ARGS', invokerArgs.join(', ')) + srcLines[14] + srcLines[15];

    // Reify and return the factory function.
    eval(source);
    return result;
}

// DEBUG version of createSuspendableFunction(), with no eval.
function createDebugSuspendableFunction(asyncProtocol, invokee) {
    // Get the formal arity of the invoker function.
    var invokerArity = asyncProtocol.begin.length - 1;

    // Return the suspendable function.
    return function SUSP$DEBUG(args) {
        var t = this, l = arguments.length, a = new Array(l - invokerArity);
        for (var i = 0; i < l - invokerArity; ++i)
            a[i] = arguments[i];
        var fi = jointProtocol.acquireFiber(asyncProtocol);
        jointProtocol.setFiberTarget(fi, invokee, t, a);
        var b = new Array(invokerArity + 1);
        b[0] = fi;
        for (var i = 0; i < invokerArity; ++i)
            b[i + 1] = arguments[l - invokerArity + i];
        return asyncProtocol.begin.apply(null, b);
    };
}
module.exports = asyncBuilder;
//# sourceMappingURL=asyncBuilder.js.map
