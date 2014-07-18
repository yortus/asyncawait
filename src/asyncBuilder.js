var assert = require('assert');
var pipeline = require('./pipeline');
var _ = require('./util');


// Bootstrap an initial async builder using a no-op protocol. All methods throw, to assist in protocol debugging.
var asyncBuilder = createAsyncBuilder(_.empty, {}, {
    invoke: function (co) {
        throw new Error('invoke: not supported by this type of suspendable function');
    },
    return: function (ctx, result) {
        throw new Error('return: not supported by this type of suspendable function');
    },
    throw: function (ctx, error) {
        throw new Error('throw: not supported by this type of suspendable function');
    },
    yield: function (ctx, value) {
        throw new Error('yield: not supported by this type of suspendable function');
    }
});

/** Creates a new async builder function using the specified protocol settings. */
function createAsyncBuilder(protocolFactory, options, baseProtocol) {
    // Instantiate the protocol by calling the provided factory function.
    var protocol = _.mergeProps({}, baseProtocol, protocolFactory(options, baseProtocol));

    // Create the builder function.
    var builder = function asyncBuilder(invokee) {
        // Once an async(...) method has been called, ensure subsequent calls to asyncawait.use(...) fail.
        pipeline.isLocked = true;

        // Validate the argument, which is expected to be a closure defining the body of the suspendable function.
        assert(arguments.length === 1, 'async builder: expected a single argument');
        assert(_.isFunction(invokee), 'async builder: expected argument to be a function');

        // Create and return an appropriately configured suspendable function for the given protocol and body.
        return createSuspendableFunction(protocol, invokee, options);
    };

    // Tack on the protocol and options properties, and the derive() method.
    builder.protocol = protocol;
    builder.options = options;
    builder.derive = createDeriveMethod(protocol, protocolFactory, options, baseProtocol);

    // Return the async builder function.
    return builder;
}

/** Creates a derive method appropriate to the given protocol settings. */
function createDeriveMethod(protocol, protocolFactory, options, baseProtocol) {
    return function derive() {
        // Validate the arguments.
        var len = arguments.length;
        assert(len > 0, 'derive: expected at least one argument');
        var arg0 = arguments[0], hasProtocolFactory = _.isFunction(arg0);
        assert(hasProtocolFactory || len === 1, 'derive: invalid argument combination');

        // Determine the appropriate options to pass to createAsyncBuilder.
        var opts = {};
        if (!hasProtocolFactory)
            _.mergeProps(opts, options);
        _.mergeProps(opts, hasProtocolFactory ? arguments[1] : arg0);

        // Determine the appropriate protocolFactory and baseProtocol to pass to createAsyncBuilder.
        var newProtocolFactory = hasProtocolFactory ? arg0 : protocolFactory;
        var newBaseProtocol = hasProtocolFactory ? protocol : baseProtocol;

        // Delegate to createAsyncBuilder to return a new async builder function.
        return createAsyncBuilder(newProtocolFactory, opts, newBaseProtocol);
    };
}

// ================================================================================
//TODO: Find a way to hot-swap from slow to fast impl *only if* repeatedly invoked.
//      Otherwise the cost of eval is added to every invoke (approx 6x slower).
//      Fast impl is approx 20% faster than slow impl, so it needs to amortise its
//      setup cost over 100s or 1000s of invocations.
//      In particular: if user code puts something like (async(...))() in repeatedly
//      called code, then there is no oportunity for amortisation since a new
//      suspendable function is created for every call, and in this case it makes
//      no sense to use the fast impl.
// ================================================================================
/**
*  Creates a suspendable function configured for the given protocol and invokee.
*  This function is not on the hot path, but the suspendable function it returns
*  can be hot, so here we trade some time (off the hot path) to make the suspendable
*  function as fast as possible. This includes safe use of eval (safe because the
*  input to eval is entirely known and safe). By using eval, the resulting function
*  can be pieced together more optimally, as well as having the expected arity and
*  preserving the invokee's function name and parameter names (to help debugging).
*  NB: By setting DEBUG (in src/util) to true, a less optimised non-eval'd function
*  will be returned, which is helpful for step-through debugging sessions. However,
*  this function will not report the correct arity (function.length) in most cases.
*/
var createSuspendableFunction = _.DEBUG ? createSuspendableFunctionSlow : createSuspendableFunctionFast;

/** Return a general, non-eval'd suspendable template function. */
function createSuspendableFunctionSlow(protocol, invokee, options) {
    // Get the invoker's arity, which is needed inside the suspendable function.
    var invokerArgCount = protocol.invoke.length - 1;

    // Return the suspendable function.
    return function suspendable($ARGS) {
        // Distribute arguments between the invoker and invokee functions, according to their arities.
        var invokeeArgCount = arguments.length - invokerArgCount;
        var invokeeArgs = new Array(invokeeArgCount), invokerArgs = new Array(invokerArgCount + 1);
        for (var i = 0; i < invokeeArgCount; ++i)
            invokeeArgs[i] = arguments[i];
        for (var j = 1; j <= invokerArgCount; ++i, ++j)
            invokerArgs[j] = arguments[i];

        // Create a coroutine instance to hold context information for this call.
        var self = this, body = function b1() {
            invokee.apply(self, invokeeArgs);
        };
        var co = pipeline.acquireCoro(protocol, body);

        // Pass execution control over to the invoker.
        invokerArgs[0] = co;
        return protocol.invoke.apply(null, invokerArgs);
    };
}

/** Return a fast, eval'd suspendable template function. */
function createSuspendableFunctionFast(protocol, invokee, options) {
    "use strict";

    // Get all formal parameter names of the invoker and invokee functions.
    var invokerParams = _.getParamNames(protocol.invoke).slice(1);
    var invokeeParams = _.getParamNames(invokee);

    for (var i = 0; i < invokeeParams.length; ++i) {
        var paramName = invokeeParams[i];
        if (invokerParams.indexOf(paramName) === -1)
            continue;
        throw new Error("async builder: invoker and invokee both have a parameter named '" + paramName + "'");
    }

    // Calculate all the substitution values to be applied to the template function.
    var substs = {
        // Substitutions
        $SUSPENDABLE: 'suspendable_' + (invokee.name || ''),
        $PARAMS: invokeeParams.concat(invokerParams).join(', '),
        $PARAM_COUNT: invokeeParams.length + invokerParams.length,
        $INVOKER_PARAM_COUNT: '' + invokerParams.length,
        $INVOKER_PARAMS: invokerParams.join(', '),
        $INVOKEE_PARAMS: invokeeParams.join(', '),
        // Conditions
        $IF_HAS_INVOKER_PARAMS: invokerParams.length > 0,
        $IF_HAS_INVOKEE_PARAMS: invokeeParams.length > 0
    };

    // Stringify the template function above just once, and cache the result in a module variable.
    // Move comments and excess whitespace in the process.
    suspendableTemplateSource = suspendableTemplateSource || $SUSPENDABLE.toString().replace(/(?:[\s][\s]+)|(?:\/\*[^*]*\*\/)/gm, ' ');

    // Perform all substitutions to get the final source code for the suspendable function.
    var source = suspendableTemplateSource.replace(/\$(?!IF|ELSE|ENDIF)[A-Z_]+/gm, function (name) {
        return substs[name];
    }).replace(/(\$[A-Z_]+)([^$]*)\$ELSE([^$]*)\$ENDIF/gm, function ($0, $1, $2, $3) {
        return (substs[$1] ? $2 : $3);
    });

    // Eval the source code into a function, and return it. It must be eval'd inside
    // this function to close over the variables defined here.
    var result;
    eval('result = ' + source);
    return result;
}

// This module variable holds the cached source of the $SUSPENDABLE template function, defined below.
var suspendableTemplateSource;

// This is the template for an optimized suspendable function. It has substitutable parts.
function $SUSPENDABLE($PARAMS) {
    var self = this, len = arguments.length, hasThis = this && this !== global, body, co;

    /* --------------- Fast path --------------- */
    /* i.e., when argument count equals formal parameter count. */
    if (len === $PARAM_COUNT) {
        /* Create the body function. */
        if (hasThis) {
            $IF_HAS_INVOKEE_PARAMS;
            body = function b2() {
                return invokee.call(self, $INVOKEE_PARAMS);
            };
            $ELSE;
            body = function b3() {
                return invokee.call(self);
            };
            $ENDIF;
        } else {
            $IF_HAS_INVOKEE_PARAMS;
            body = function b4() {
                return invokee($INVOKEE_PARAMS);
            };
            $ELSE;
            body = invokee;
            $ENDIF;
        }

        /* Invoke the body function inside a new coroutine. */
        co = pipeline.acquireCoro(protocol, body);
        $IF_HAS_INVOKER_PARAMS;
        return protocol.invoke(co, $INVOKER_PARAMS);
        $ELSE;
        return protocol.invoke(co);
        $ENDIF;
    }

    /* --------------- General path --------------- */
    /* Distribute arguments between the invoker and invokee functions, according to their arities. */
    var invokeeArgCount = len - $INVOKER_PARAM_COUNT;
    var invokeeArgs = new Array(invokeeArgCount);
    for (var i = 0; i < invokeeArgCount; ++i)
        invokeeArgs[i] = arguments[i];
    $IF_HAS_INVOKER_PARAMS;
    var invokerArgs = new Array($INVOKER_PARAM_COUNT + 1);
    for (var j = 1; j <= $INVOKER_PARAM_COUNT; ++i, ++j)
        invokerArgs[j] = arguments[i];
    $ELSE;
    $ENDIF;

    /* Create the body function and invoke it inside a new coroutine. */
    body = function b5() {
        return invokee.apply(self, invokeeArgs);
    };
    co = pipeline.acquireCoro(protocol, body);
    $IF_HAS_INVOKER_PARAMS;
    invokerArgs[0] = co;
    return protocol.invoke.apply(null, invokerArgs);
    $ELSE;
    return protocol.invoke(co);
    $ENDIF;
}

// These are dummies; their presence ensures the template function above is syntactically valid.
var $PARAM_COUNT, $INVOKEE_PARAMS, $INVOKER_PARAMS, $INVOKER_PARAM_COUNT;
var $IF_HAS_INVOKEE_PARAMS, $IF_HAS_INVOKER_PARAMS, $ELSE, $ENDIF;
var invokee, protocol;
module.exports = asyncBuilder;
//# sourceMappingURL=asyncBuilder.js.map
