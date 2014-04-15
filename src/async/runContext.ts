import _refs = require('_refs');
import Promise = require('bluebird');
import Semaphore = require('./semaphore');
export = RunContext;


/**
 * This class is used to pass all required contextual information to the runInFiber()
 * function as a single argument. runInFiber() can only accept a single argument because
 * it is invoked via Fiber#run(), which can only pass through a single argument.
 */
class RunContext {
    constructor(wrapped: Function, thisArg, argsAsArray: any[], semaphore: Semaphore) {
        this.wrapped = wrapped;
        this.thisArg = thisArg;
        this.argsAsArray = argsAsArray;
        this.semaphore = semaphore;
    }

    wrapped: Function;
    thisArg: any;
    argsAsArray: any[];
    semaphore: Semaphore;

    resolver: Promise.Resolver<any> = null;
    callback: (err, val?) => void = null;
}
