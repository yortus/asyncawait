import references = require('references');
import _ = require('lodash');


//TODO: temp testing...
import Promise = require('bluebird');
import Fiber = require('fibers');
import semaphore = require('./semaphore');
import fiberPool = require('./fiberPool');


import Protocol = require('./protocols/base');
export = async;


// Create an abstract async function from which all others can be bootstrapped using mod(...)
var async = makeAsyncFunc((resume, suspend, options) => {
    var resolver = Promise.defer<any>();
    var result =  {
        create: () => {},
        delete: () => {},
        return: result => {},
        throw: error => {},
        yield: value => {}
    };
    return result;
});


/** Creates an async function using the specified protocol. */
function makeAsyncFunc(factory: (resume: () => void, suspend: () => void, options?: any) => AsyncAwait.Protocol2, options?: any) {

    //TODO: ...
    var newProtocol = factory(() => {}, () => {}, options);
    var protocolArgCount = newProtocol.create.length;



    // Create the async function.
    var result: AsyncAwait.AsyncFunction2 = <any> function async(suspendableDefn: Function) {

        if (arguments.length !== 1) throw new Error('async(): expected a single argument');
        if (!_.isFunction(suspendableDefn)) throw new Error('async(): expected argument to be a function');

        // The following function is the 'template' for the returned suspendable function.
        function asyncRunner($ARGS) {

            // Distribute arguments between the suspendable function and the protocol's invoke() method
            var argCount = arguments.length, suspendableArgCount = argCount - protocolArgCount;
            var sArgs = new Array(suspendableArgCount), pArgs = new Array(protocolArgCount);
            for (var i = 0; i < suspendableArgCount; ++i) sArgs[i] = arguments[i];
            for (var i = 0; i < protocolArgCount; ++i) pArgs[i] = arguments[i + suspendableArgCount];

            // Begin execution of the suspendable function definition in a new coroutine.
            // TODO: ...



            // TODO...------------------------------------------
            var _run = () => suspendableDefn.apply(this, sArgs);
            var co = new Co(_run);
            //var _fiber: Fiber;
            //var _delete: () => void;
            //var _return: (result: any) => void;
            //var _throw: (error: Error) => void;
            //var _yield: (value: any) => void;

            //function _dispose() {
            //    fiberPool.dec();
            //    _fiber = null;
            //    _run = null;
            //    semaphore.leave();
            //    _delete();
            //}

            //function _makeFiberBody() {
            //    var tryBlock = () => _return(_run());
            //    var catchBlock = err => _throw(err);
            //    var finallyBlock = () => _dispose();

            //    // V8 may not optimise the following function due to the presence of
            //    // try/catch/finally. Therefore it does as little as possible, only
            //    // referencing the optimisable closures prepared above.
            //    return function fiberBody() {
            //        try { tryBlock(); }
            //        catch (err) { catchBlock(err); }
            //        finally { finallyBlock(); }
            //    };
            //}

            //function resume() {

            //    // Define a function to resume the fiber, lazily creating it on the initial call.
            //    var doResume = () => {
            //        if (!_fiber) {
            //            fiberPool.inc();
            //            var fiber = Fiber(_makeFiberBody());
            //            fiber.yield = value => { _yield(value); };
            //            _fiber = fiber;
            //        }
            //        _fiber.run();
            //    }

            //    // Route all top-level initial resume()s through the global semaphore.
            //    var isTopLevelInitial = !_fiber && !Fiber.current;
            //    if (isTopLevelInitial) semaphore.enter(doResume); else doResume();
            //}

            //function suspend() {
            //    //TODO: ensure _fiber === Fiber.current ?!
            //    Fiber.yield();
            //}
            // TODO...------------------------------------------




            // TODO: temp testing...!!!!
            var protocol = factory(() => co.resume(), () => co.suspend(), options);
            co._return = v => protocol.return(v);
            co._throw = v => protocol.throw(v);
            co._yield = v => protocol.yield(v);
            co._delete = () => protocol.delete();
            return protocol.create.apply(protocol, pArgs); // TODO: optimise in empty array case
        }

        // Create the suspendable function from the template function above, giving it the correct arity.
        var result, args = [], arity = suspendableDefn.length + protocolArgCount;
        for (var i = 0; i < arity; ++i) args.push('a' + i);
        var funcDefn, funcCode = eval('funcDefn = ' + asyncRunner.toString().replace('$ARGS', args.join(', ')));
        return funcDefn;
    };

    // Tack on the mod(...) method.
    result.mod = function(factory_?: (resume: () => void, suspend: () => void) => AsyncAwait.Protocol2, options?: any) {

        // Create a new options object with appropriate fallback values.
        //TODO:...

        // Create a new async function from the current one.
        return makeAsyncFunc(factory_ || factory, options);
    }

    // Return the resulting async function.
    return result;
}


class Co {

    constructor(public _run) {}

    _fiber: Fiber;
    _delete: () => void;
    _return: (result: any) => void;
    _throw: (error: Error) => void;
    _yield: (value: any) => void;

    _dispose() {
        fiberPool.dec();
        this._fiber = null;
        this._run = null;
        semaphore.leave();
        this._delete();
    }

    _makeFiberBody() {
        var tryBlock = () => this._return(this._run());
        var catchBlock = err => this._throw(err);
        var finallyBlock = () => this._dispose();

        // V8 may not optimise the following function due to the presence of
        // try/catch/finally. Therefore it does as little as possible, only
        // referencing the optimisable closures prepared above.
        return function fiberBody() {
            try { tryBlock(); }
            catch (err) { catchBlock(err); }
            finally { finallyBlock(); }
        };
    }

    resume() {

        // Define a function to resume the fiber, lazily creating it on the initial call.
        var doResume = () => {
            if (!this._fiber) {
                fiberPool.inc();
                var fiber = Fiber(this._makeFiberBody());
                fiber.yield = value => { this._yield(value); };
                this._fiber = fiber;
            }
            this._fiber.run();
        }

        // Route all top-level initial resume()s through the global semaphore.
        var isTopLevelInitial = !this._fiber && !Fiber.current;
        if (isTopLevelInitial) semaphore.enter(doResume); else doResume();
    }

    suspend() {
        //TODO: ensure _fiber === Fiber.current ?!
        Fiber.yield();
    }
}
