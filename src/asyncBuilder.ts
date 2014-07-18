import references = require('references');
import assert = require('assert');
import pipeline = require('./pipeline');
import _ = require('./util');
import Builder = AsyncAwait.Async.Builder;
import Protocol = AsyncAwait.Async.Protocol;
import Options = AsyncAwait.Async.Options;
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
function createAsyncBuilder<TBuilder extends Builder>(protocolFactory: (options: Options, baseProtocol: Protocol) => ProtocolOverrides, options: Options, baseProtocol: Protocol) {

    // Instantiate the protocol by calling the provided factory function.
    var protocol: Protocol = <any> _.mergeProps({}, baseProtocol, protocolFactory(options, baseProtocol));

    // Create the builder function.
    var builder: TBuilder = <any> function asyncBuilder(invokee: Function) {

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
        assert(len > 0, 'derive(): expected at least one argument');
        var arg0 = arguments[0], hasProtocolFactory = _.isFunction(arg0);
        assert(hasProtocolFactory || len === 1, 'derive(): invalid argument combination');

        // Determine the appropriate options to pass to createAsyncBuilder.
        var opts = {};
        if (!hasProtocolFactory) _.mergeProps(opts, options);
        _.mergeProps(opts, hasProtocolFactory ? arguments[1] : arg0);

        // Determine the appropriate protocolFactory and baseProtocol to pass to createAsyncBuilder.
        var newProtocolFactory = hasProtocolFactory ? arg0 : protocolFactory;
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
 *  can be pieced together more optimally, as well as having the expected arity and
 *  preserving the invokee's function name and parameter names (to help debugging).
 *  NB: By setting DEBUG (in src/util) to true, a less optimised non-eval'd function
 *  will be returned, which is helpful for step-through debugging sessions. However,
 *  this function will not report the correct arity (function.length) in most cases.
 */
var createSuspendableFunction = _.DEBUG ? createSuspendableFunctionSlow : createSuspendableFunctionFast;

function createSuspendableFunctionSlow(protocol, invokee, options: Options) {

    // Get the invoker's arity, which is needed inside the suspendable function.
    var invokerArgCount = protocol.invoke.length - 1;

    // Return the suspendable function.
    return function suspendable($ARGS) {

        // Distribute arguments between the invoker and invokee functions, according to their arities.
        var invokeeArgCount = arguments.length - invokerArgCount;
        var invokeeArgs = new Array(invokeeArgCount), invokerArgs = new Array(invokerArgCount + 1);
        for (var i = 0; i < invokeeArgCount; ++i) invokeeArgs[i] = arguments[i];
        for (var j = 1; j <= invokerArgCount; ++i, ++j) invokerArgs[j] = arguments[i];

        // Create a coroutine instance to hold context information for this call.
        var body = () => invokee.apply(this, invokeeArgs);
        var co = pipeline.acquireCoro(protocol, body);

        // Pass execution control over to the invoker.
        invokerArgs[0] = co;
        return protocol.invoke.apply(null, invokerArgs);
    }
}

function createSuspendableFunctionFast(protocol, invokee, options: Options) {
    "use strict";

    // Declare the general shape of the suspendable function.
    function $SUSPENDABLE_TEMPLATE($ARGS) {

        // Code for the fast path will be injected here.
        var self = this, body = $BODYEXPR;
        if (arguments.length === $ARGCOUNT) { $FASTPATH }

        // Distribute arguments between the invoker and invokee functions, according to their arities.
        var invokeeArgCount = arguments.length - invokerArgCount, invokeeArgs = new Array(invokeeArgCount);
        for (var i = 0; i < invokeeArgCount; ++i) invokeeArgs[i] = arguments[i];
        $SETUP_INVOKER_ARGS

        // Create a coroutine instance to hold context information for this call.
        body = function b3() { return invokee.apply(self, invokeeArgs); };
        var co = pipeline.acquireCoro(protocol, body);

        // Pass execution control over to the invoker.
        $CALL_INVOKER
    }

    // Get the invoker's arity, which is needed inside the suspendable function.
    var invokerArgCount = protocol.invoke.length - 1;

    // Get all parameter names of the invoker and invokee.
    var invokerParamNames = _.getParamNames(protocol.invoke).slice(1); // Skip the 'co' parameter.
    var invokeeParamNames = _.getParamNames(invokee);

    //TODO:...
    var invokeeArgs = invokeeParamNames.join(', ');
    var bodyNoThis = invokeeParamNames.length === 0 ? 'invokee' : 'function b1() { return invokee(' + invokeeArgs + '); }';
    var bodyWithThis = ' function b2() { return invokee.call(self' + (invokeeParamNames.length > 0 ? ', ' + invokeeArgs : '') + '); }'
    var $BODYEXPR: any = '(!this || this === global) ? ' + bodyNoThis + ' : ' + bodyWithThis;

    //TODO:...
    if (invokerArgCount === 0) var $SETUP_INVOKER_ARGS = ''; else $SETUP_INVOKER_ARGS =
        'var invokerArgs = new Array(invokerArgCount + 1); ' +
        'for (var j = 1; j <= invokerArgCount; ++i, ++j) invokerArgs[j] = arguments[i];';

    //TODO:...
    if (invokerArgCount === 0) var $CALL_INVOKER = 'return protocol.invoke(co);';
    else var $CALL_INVOKER = 'invokerArgs[0] = co; return protocol.invoke.apply(null, invokerArgs);';

    // Ensure there are no clashes between invoker/invokee parameter names.
    for (var i = 0; i < invokeeParamNames.length; ++i) {
        var paramName = invokeeParamNames[i];
        if (invokerParamNames.indexOf(paramName) === -1) continue;
        throw new Error("async builder: invoker and invokee both have a parameter named '" + paramName + "'");
    }

    // The two parameter lists together form the parameter list of the suspendable function.
    var allParamNames = invokeeParamNames.concat(invokerParamNames);
    var $ARGCOUNT: any = '' + allParamNames.length;

    // Stringify $SUSPENDABLE_TEMPLATE just once and cache the result in a module variable.
    suspendableTemplateSource = suspendableTemplateSource || $SUSPENDABLE_TEMPLATE.toString(); 

    // Assemble the source code for the suspendable function's fast path.
    // NB: If the calling context need not be preserved, we can avoid using the slower Function#call().
    var $FASTPATH =
        'var co = pipeline.acquireCoro(protocol, body); ' +
        'return protocol.invoke(co' + (invokerParamNames.length ? ', ' + invokerParamNames.join(', ') : '') + ');';

    // Substitute all placeholders in the template function to get the final source code.
    var source = suspendableTemplateSource
        .replace('$SUSPENDABLE_TEMPLATE', 'suspendable_' + invokee.name)
        .replace('$ARGS', allParamNames.join(', '))
        .replace('$BODYEXPR', $BODYEXPR)
        .replace('$ARGCOUNT', $ARGCOUNT)
        .replace('$FASTPATH', $FASTPATH)
        .replace('$SETUP_INVOKER_ARGS', $SETUP_INVOKER_ARGS)
        .replace('$CALL_INVOKER', $CALL_INVOKER);

    // Eval the source code into a function, and return it. It must be eval'd inside
    // this function to close over the variables defined here.
    var result;
    eval('result = ' + source);
    return result;
}


// This module variable holds the cached source of $SUSPENDABLE_TEMPLATE, defined above.
var suspendableTemplateSource;
