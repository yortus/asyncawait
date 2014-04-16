﻿import _refs = require('_refs');
import Fiber = require('fibers');
import Promise = require('bluebird');
import _ = require('lodash');
import Config = require('./config');
import FiberMgr = require('./fiberManager');
import RunContext = require('./runContext');
import Semaphore = require('./semaphore');
import AsyncIterator = require('./asyncIterator');
export = makeAsyncFunc;


/** Function for creating a specific variant of the async function. */
function makeAsyncFunc(config: Config): AsyncAwait.AsyncFunction {

    // Validate the specified configuration
    config.validate();
    
    // Create an async function tailored to the given options.
    var result: AsyncAwait.AsyncFunction = <any> function(bodyFunc: Function) {

        // Create a semaphore for limiting top-level concurrency, if specified in options.
        var semaphore = config.maxConcurrency ? new Semaphore(config.maxConcurrency) : Semaphore.unlimited;

        // Choose and run the appropriate function factory based on whether the result should be iterable.
        var makeFunc = config.isIterable ? makeAsyncIterator : makeAsyncNonIterator;
        var result: Function = makeFunc(bodyFunc, config, semaphore);

        // Ensure the suspendable function's arity matches that of the function it wraps.
        var arity = bodyFunc.length;
        if (config.acceptsCallback) ++arity;
        result = makeFuncWithArity(result, arity);
        return result;
    };

    // Add the mod() function, and return the result.
    result.mod = (options_: any, acceptsCallback?: boolean, maxConcurrency?: number) => {
        if (_.isString(options_)) {
            var newConfig = new Config(config);
            switch(options_) {
                case 'returns: promise, iterable: false':   newConfig.returnValue = 'promise';  newConfig.isIterable = false;   break;
                case 'returns: thunk, iterable: false':     newConfig.returnValue = 'thunk';    newConfig.isIterable = false;   break;
                case 'returns: value, iterable: false':     newConfig.returnValue = 'value';    newConfig.isIterable = false;   break;
                case 'returns: none, iterable: false':      newConfig.returnValue = 'none';     newConfig.isIterable = false;   break;
                case 'returns: promise, iterable: true':    newConfig.returnValue = 'promise';  newConfig.isIterable = true;    break;
                case 'returns: thunk, iterable: true':      newConfig.returnValue = 'thunk';    newConfig.isIterable = true;    break;
                case 'returns: value, iterable: true':      newConfig.returnValue = 'value';    newConfig.isIterable = true;    break;
                case 'returns: none, iterable: true':       newConfig.returnValue = 'none';     newConfig.isIterable = true;    break;
            }
            newConfig.acceptsCallback = acceptsCallback;
            newConfig.maxConcurrency = maxConcurrency;
        } else {
            var newConfig = new Config(_.defaults({}, options_, config));
        }
        return makeAsyncFunc(newConfig);
    };
    return result;
}


/** Function for creating iterable suspendable functions. */
function makeAsyncIterator(bodyFunc: Function, config: Config, semaphore: Semaphore) {

    // Return a function that returns an iterator.
    return function (): any {

        // Capture the initial arguments used to start the iterator, as an array.
        var startupArgs = new Array(arguments.length + 1); // Reserve 0th arg for the yield function. 
        for (var i = 0, len = arguments.length; i < len; ++i) startupArgs[i + 1] = arguments[i];

        // Create a yield() function tailored for this iterator.
        var yield_ = expr => {
            //TODO: await expr first? YES if options.returnValue === ReturnValue.Result
            if (runContext.callback) runContext.callback(null, { value: expr, done: false });
            if (runContext.resolver) runContext.resolver.resolve({ value: expr, done: false });
            Fiber.yield();
        }

        // Insert the yield function as the first argument when starting the iterator.
        startupArgs[0] = yield_;

        // Configure the run context.
        var runContext = new RunContext(bodyFunc, this, startupArgs);
        if (config.returnValue === Config.PROMISE) runContext.resolver = Promise.defer<any>(); // non-falsy sentinel for AsyncIterator.
        if (config.acceptsCallback) runContext.callback = ()=>{}; // non-falsy sentinel for AsyncIterator.

        // Create the iterator.
        var iterator = new AsyncIterator(runContext, semaphore);

        // Wrap the given bodyFunc to properly complete the iteration.
        runContext.wrapped = () => {
            var len = arguments.length, args=new Array(len);
            for (var i = 0; i < len; ++i) args[i] = arguments[i];
            bodyFunc.apply(this, args);
            iterator.destroy();
            return { done: true };
        }

        // Return the iterator.
        return iterator;
    };
}


/** Function for creating non-iterable suspendable functions. */
function makeAsyncNonIterator(bodyFunc: Function, config: Config, semaphore: Semaphore) {

    // Return a function that executes fn in a fiber and returns a promise of fn's result.
    return function (): any {

        // Get all the arguments passed in, as an array.
        var argsAsArray = new Array(arguments.length);
        for (var i = 0; i < argsAsArray.length; ++i) argsAsArray[i] = arguments[i];

        // Remove concurrency restrictions for nested calls, to avoid race conditions.
        if (FiberMgr.isExecutingInFiber()) this._semaphore = Semaphore.unlimited;

        // Configure the run context.
        var runContext = new RunContext(bodyFunc, this, argsAsArray, () => semaphore.leave());
        if (config.returnValue === Config.PROMISE) {
            var resolver = Promise.defer<any>();
            runContext.resolver = resolver;
        }
        if (config.acceptsCallback && argsAsArray.length && _.isFunction(argsAsArray[argsAsArray.length - 1])) {
            var callback = argsAsArray.pop();
            runContext.callback = callback;
        }

        // Execute bodyFunc to completion in a coroutine.
        semaphore.enter(() => FiberMgr.create().run(runContext));

        // Return the appropriate value.
        return config.returnValue === Config.PROMISE ? resolver.promise : undefined;
    };
}


/** Returns a function that directly proxies the given function, whilst reporting the given arity. */
function makeFuncWithArity(fn: Function, arity: number) {

    // Need to handle each arity individually, but the body never changes.
    switch (arity) {
        case 0: return function () {var i,l=arguments.length,r=new Array(l);for(i=0;i<l;++i)r[i]=arguments[i];return fn.apply(this,r)}
        case 1: return function (a) {var i,l=arguments.length,r=new Array(l);for(i=0;i<l;++i)r[i]=arguments[i];return fn.apply(this,r)}
        case 2: return function (a,b) {var i,l=arguments.length,r=new Array(l);for(i=0;i<l;++i)r[i]=arguments[i];return fn.apply(this,r)}
        case 3: return function (a,b,c) {var i,l=arguments.length,r=new Array(l);for(i=0;i<l;++i)r[i]=arguments[i];return fn.apply(this,r)}
        case 4: return function (a,b,c,d) {var i,l=arguments.length,r=new Array(l);for(i=0;i<l;++i)r[i]=arguments[i];return fn.apply(this,r)}
        case 5: return function (a,b,c,d,e) {var i,l=arguments.length,r=new Array(l);for(i=0;i<l;++i)r[i]=arguments[i];return fn.apply(this,r)}
        case 6: return function (a,b,c,d,e,f) {var i,l=arguments.length,r=new Array(l);for(i=0;i<l;++i)r[i]=arguments[i];return fn.apply(this,r)}
        case 7: return function (a,b,c,d,e,f,g) {var i,l=arguments.length,r=new Array(l);for(i=0;i<l;++i)r[i]=arguments[i];return fn.apply(this,r)}
        case 8: return function (a,b,c,d,e,f,g,h) {var i,l=arguments.length,r=new Array(l);for(i=0;i<l;++i)r[i]=arguments[i];return fn.apply(this,r)}
        case 9: return function (a,b,c,d,e,f,g,h,i) {var i,l=arguments.length,r=new Array(l);for(i=0;i<l;++i)r[i]=arguments[i];return fn.apply(this,r)}
        default: return fn; // Bail out if arity is crazy high.
    }
}
