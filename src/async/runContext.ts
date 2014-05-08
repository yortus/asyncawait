import _refs = require('_refs');
import Promise = require('bluebird');
export = RunContext;


/**
 * This class is used to pass all required contextual information to the runInFiber()
 * function as a single argument. runInFiber() can only accept a single argument because
 * it is invoked via Fiber#run(), which can only pass through a single argument.
 */
class RunContext implements AsyncAwait.RunContext {

    /** Construct a new RunContext instance. */
    constructor(suspendable: Function, thisArg, argsAsArray: any[], done?: () => void) {
        this.suspendable = suspendable;
        this.thisArg = thisArg;
        this.argsAsArray = argsAsArray;
        this.done = done;
    }

    /** The function to be executed in a fiber. */
    suspendable: Function;

    /** 'this' context to be applied to the wrapped function. */
    thisArg: any;

    /** The arguments to pass to the wrapped function. */
    argsAsArray: any[];

    /** Optional callback to unconditionally call after the wrapped function has exited. */
    done: () => void;

    /** Optional promise resolver for notifying the wrapped function's return/throw value. */
    resolver: Promise.Resolver<any> = null;

    /** Optional callback for notifying the wrapped function's return/throw value. */
    callback: (err, val?) => void = null;
}
