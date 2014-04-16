import _refs = require('_refs');
import Fiber = require('fibers');
import Promise = require('bluebird');
import _ = require('lodash');
import Config = require('./config');
import FiberMgr = require('./fiberManager');
import RunContext = require('./runContext');
import Semaphore = require('./semaphore');
import AsyncIterator = require('./asyncIterator');
export = createAsyncFunction;


/** Function for creating a specific variant of the async function. */
function createAsyncFunction(config: Config): AsyncAwait.AsyncFunction {
    
    // Create an async function tailored to the given options.
    var result: AsyncAwait.AsyncFunction = <any> function(bodyFunc: Function) {

        // Create a semaphore for limiting top-level concurrency, if specified in options.
        var semaphore = config.maxConcurrency ? new Semaphore(config.maxConcurrency) : Semaphore.unlimited;

        // Choose and run the appropriate function factory based on whether the result should be iterable.
        var createFn = config.isIterable ? createAsyncIterator : createAsyncNonIterator;
        var result: Function = createFn(bodyFunc, config, semaphore);

        //TODO: 'arity' should be +1 if CallbackArg.Required (think of mocha's 'done', express's 'next', ...)
        //TODO: document this...
        result = passThruWithArity(result, bodyFunc.length);
        return result;
    };

    // Add the config property and the mod() function, and return the result.
    result.config = config;
    result.mod = (options_) => {
        var options: any = _.defaults({}, options_, config);
        return createAsyncFunction(options);
    };
    return result;
}


/** Function for creating iterable async-wrapped functions. */
function createAsyncIterator(bodyFunc: Function, config: Config, semaphore: Semaphore) {

    // Return a function that returns an iterator.
    return function (): any {

        // Capture the initial arguments used to start the iterator.
        var argsAsArray = new Array(arguments.length);
        for (var i = 0; i < argsAsArray.length; ++i) argsAsArray[i] = arguments[i];

        // Create a yield() function tailored for this iterator.
        var yield_ = expr => {
            //TODO: await expr first? YES if options.returnValue === ReturnValue.Result
            if (runContext.callback) runContext.callback(null, { value: expr, done: false });
            if (runContext.resolver) runContext.resolver.resolve({ value: expr, done: false });
            Fiber.yield();
        }

        // Insert the yield function as the first argument when starting the iterator.
        argsAsArray.unshift(yield_);

        // Configure the run context.
        var runContext = new RunContext(bodyFunc, this, argsAsArray);
        if (config.returnValue === Config.PROMISE) runContext.resolver = <any> true; //TODO: Hacky?
        if (config.callbackArg === Config.REQUIRED) runContext.callback = <any> true; //TODO: Hacky?

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


/** Function for creating non-iterable async-wrapped functions. */
function createAsyncNonIterator(bodyFunc: Function, config: Config, semaphore: Semaphore) {

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
        if (config.callbackArg === Config.REQUIRED) {
            //TODO: pop() or take [nth] depending on isVariadic
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
function passThruWithArity(fn: Function, arity: number) {

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
