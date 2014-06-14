import references = require('references');
import _ = require('lodash');


//TODO: temp testing...
import Promise = require('bluebird');
import Fiber = require('fibers');
import semaphore = require('./semaphore');
import fiberPool = require('./fiberPool');


//import Protocol = require('./protocols/base');
export = async;



interface ProtocolEx extends AsyncAwait.Protocol {
    _run: () => void;
}


//TODO: move to own file/module...
class Co {

    constructor() { }

    resume() {

        // Define a function to resume the fiber, lazily creating it on the initial call.
        var doResume = () => {
            if (!this._fiber) {
                fiberPool.inc();
                var fiber = Fiber(this._makeFiberBody());
                fiber.yield = value => { this.yield(value); };
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

    create() { }

    delete() { }

    return(result: any) { }

    throw(error: Error) { }

    yield(value: any) { }

    _makeFiberBody() {
        var tryBlock = () => this.return(this._run());
        var catchBlock = err => this.throw(err);
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

    _dispose() {
        fiberPool.dec();
        this._fiber = null;
        this._run = null;
        semaphore.leave();
        this.delete();
    }

    _run: () => void = nullFunc; //TODO: ...?

    _fiber: Fiber = null;
}


var co = new Co();






// Create an abstract async function from which all others can be bootstrapped using mod(...)
var async = makeAsyncFunc(() => {
    var result: any = {};
    result.resume = co.resume;
    result.suspend = co.suspend;
    result.create = co.create;
    result.delete = co.delete;
    result.return = co.return;
    result.throw = co.throw;
    result.yield = co.yield;
    result._makeFiberBody = co._makeFiberBody;
    result._dispose = co._dispose;
    result._run = co._run;
    result._fiber = co._fiber;
    return result;
});


/** Creates an async function using the specified protocol. */
function makeAsyncFunc(protocolOverride: AsyncAwait.ProtocolOverride) {

    //TODO: ...
    var newProtocol = protocolOverride( new Co();
    var protocolArgCount = newProtocol.create.length;



    // Create the async function.
    var result: AsyncAwait.AsyncFunction = <any> function async(suspendableDefn: Function) {

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

            // TODO: temp testing...!!!!
            var protocol: ProtocolEx = <any> protocolFactory();
            protocol._run = () => suspendableDefn.apply(this, sArgs);


            return protocol.create.apply(protocol, pArgs); // TODO: optimise in empty array case
        }

        // Create the suspendable function from the template function above, giving it the correct arity.
        var result, args = [], arity = suspendableDefn.length + protocolArgCount;
        for (var i = 0; i < arity; ++i) args.push('a' + i);
        var funcDefn, funcCode = eval('funcDefn = ' + asyncRunner.toString().replace('$ARGS', args.join(', ')));
        return funcDefn;
    };



    // Tack on the mod(...) method.
    result.mod = function mod<TAsyncFunction extends AsyncAwait.AsyncFunction>(override_?: AsyncAwait.ProtocolOverride, options_?: {}): TAsyncFunction {

        // Parse arguments
        var override = _.isFunction(override_) ? override_ : null;
        var options = override ? options_ : <any> override_;

        //TODO:...
        if (override) {
            var newProtocolFactory = (opts?: {}) => {



                //var oldProtocol = protocolFactory();
                //function Protocol() {}
                //Protocol.prototype = oldProtocol;
                //var newProtocol = new Protocol();

                var newProtocol = protocolFactory();


                //TODO: was... var newProtocol = protocolFactory();
                var overrides = override(newProtocol, opts || options);
                //if (overrides !== newProtocol) {
                    if (overrides.create) newProtocol.create = overrides.create;
                    if (overrides.delete) newProtocol.delete = overrides.delete;
                    if (overrides.return) newProtocol.return = overrides.return;
                    if (overrides.throw) newProtocol.throw = overrides.throw;
                    if (overrides.yield) newProtocol.yield = overrides.yield;
                //}
                return newProtocol;
            };
        } else {
            newProtocolFactory = (opts?: {}) => protocolFactory(opts || options);
        }

        return <TAsyncFunction> makeAsyncFunc(newProtocolFactory);


    }

    // Return the resulting async function.
    return result;
}






function nullFunc() { }
