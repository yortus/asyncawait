import _refs = require('_refs');
import Fiber = require('fibers');
import Promise = require('bluebird');
import runInFiber = require('./runInFiber');
import RunContext = require('./runContext');
import CallbackArg = require('./callbackArg');
import ReturnValue = require('./returnValue');
import await = require('../await/index');
export = AsyncIterator;


/**
 * TODO: ...
 */
class AsyncIterator {

    /**
     * TODO: ...
     */
    constructor(private runContext: RunContext) {

        // 1 iterator <==> 1 fiber
        this.fiber = Fiber(runInFiber);
    }

    /**
     * TODO: ...
     */
    next() {
        if (this.runContext.options.callbackArg === CallbackArg.Required) {
            var callback = arguments[0];
            this.runContext.callback = callback;
        }
        if (this.runContext.options.returnValue === ReturnValue.Promise) {
            var resolver = Promise.defer<any>();
            this.runContext.resolver = resolver;
        }

        // Run the fiber until it either yields a value or completes.
        //TODO: apply semaphore...
        //TODO: BUT...    // Remove concurrency restrictions for nested calls, to avoid race conditions.
        this.fiber.run(this.runContext);

        // Return the appropriate value.
        return this.runContext.options.returnValue === ReturnValue.Promise ? resolver.promise : undefined;
    }

    /**
     * TODO: ...
     */
    forEach(callback: (value) => void) {

        //TODO: Hmmm... maybe we should insist on being in a fiber to make forEach available?
        // Otherwise, it will return immediately, or it needs to accept a callback, or return a promise

        //if (this.runContext.options.callbackArg === CallbackArg.Required) {

        //    var handler: any = (err, result) => {
        //        //TODO: What to do if !!err? its async so can't throw into caller.
        //        if (result.done) return;
        //        callback(result.value);
        //        setImmediate(this.next.bind(this), handler);
        //    }
        //    (<Function> this.next)(handler);

        //} else if (this.runContext.options.returnValue === ReturnValue.Promise) {

        //    //TODO: What to do if !!err? its async so can't throw into caller.
        //    var handler: any = (result) => {
        //        if (result.done) return;
        //        callback(result.value);
        //        setImmediate(() => this.next().then(handler));
        //    }
        //    this.next().then(handler);

        //} else {
        //    throw new Error('Not supported!'); // TODO: more useful message...
        //}



        //TODO: can't use await in here! We may -not- be in a fiber
        while (true) {
            var i = await (this.next());
            if (i.done) break;
            callback(i.value);
        }
    }

    private fiber: Fiber;
}
