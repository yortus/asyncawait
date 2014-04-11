import _refs = require('_refs');
import Fiber = require('fibers');
import Promise = require('bluebird');
import await = require('../await');


//TODO: ...
export enum AsyncOutput {
    Promise,
    PromiseIterator
}


/**
 * The wrapper() function accepts a Context instance, and calls the wrapped function which is
 * described in the context. The result of the call is used to resolve the context's promise.
 * If an exception is thrown, the context's promise is rejected. This function must take all
 * its information in a single argument (i.e. the context), because it is called via
 * Fiber#run(), which accepts at most one argument.
 */
export function wrapper(ctx: Context) {
    try {

        // Keep track of how many fibers are active
        adjustFiberCount(+1);

        // Call the wrapped function. It may get suspended at await and/or yield calls.
        var result = ctx.wrapped.apply(ctx.thisArg, ctx.argsAsArray);

        // If we get here, the wrapped function returned normally.
        switch (ctx.output) {
            case AsyncOutput.Promise:
                ctx.value.resolve(result);
                break;
            case AsyncOutput.PromiseIterator:
                ctx.value.resolve(undefined);
                ctx.done.resolve(true);
                break;
        }
    }
    catch (err) {

        // If we get here, the wrapped function had an unhandled exception.
        switch (ctx.output) {
            case AsyncOutput.Promise:
                ctx.value.reject(err);
                break;
            case AsyncOutput.PromiseIterator:
                ctx.value.reject(err);
                ctx.done.resolve(true);
                break;
        }
    }
    finally {

        // Keep track of how many fibers are active
        adjustFiberCount(-1);

        // TODO: for semaphores
        ctx.semaphore.leave();
    }
}


/** A class for encapsulating the single argument passed to the wrapper() function. */
export class Context {
    constructor(output: AsyncOutput, wrapped: Function, thisArg, argsAsArray: any[], semaphore: Semaphore) {
        this.output = output;
        this.wrapped = wrapped;
        this.thisArg = thisArg;
        this.argsAsArray = argsAsArray;
        this.semaphore = semaphore;
    }

    output: AsyncOutput;
    wrapped: Function;
    thisArg: any;
    argsAsArray: any[];
    semaphore: Semaphore;

    value: Promise.Resolver<any>;
    done: Promise.Resolver<boolean>;
}



/** A simple abstraction for limiting concurrent function calls to a specific upper bound. */
export class Semaphore {

    static unlimited = new Semaphore(10000000);

    constructor(private n: number) {
        this._avail = n;
    }

    enter(fn: () => void) {
        if (this._avail > 0) {
            --this._avail;
            fn();
        } else {
            this._queued.push(fn);
        }
    }

    leave() {
        if (this._queued.length > 0) {
            var fn = this._queued.pop();
            fn();
        } else {
            ++this._avail;
        }
    }

    private _avail: number;
    private _queued: Function[] = [];
}


/**
 * The following functionality prevents memory leaks in node-fibers by actively managing Fiber.poolSize.
 * For more information, see https://github.com/laverdet/node-fibers/issues/169.
 */
var fiberPoolSize = Fiber.poolSize;
var activeFiberCount = 0;
function adjustFiberCount(delta: number) {
    activeFiberCount += delta;
    if (activeFiberCount >= fiberPoolSize) {
        fiberPoolSize += 100;
        Fiber.poolSize = fiberPoolSize;
    }
}


/**
 * TODO: ...
 */
export class Iterator {

    /**
     * TODO: ...
     */
    constructor(private fiber: Fiber, private context: Context) {}

    /**
     * TODO: ...
     */
    next(): { value: Promise<any>; done: Promise<boolean> } {
        var value = Promise.defer<any>();
        var done = Promise.defer<boolean>();

        this.context.value = value;
        this.context.done = done;
        this.fiber['value'] = value;
        this.fiber['done'] = done;

        // Run the fiber until it either yields a value or completes
        this.fiber.run(this.context);

        return { value: value.promise, done: done.promise };
    }

    /**
     * TODO: ...
     */
    forEach(callback: (value) => void) {
        while (true) {
            var i = this.next();
            if (await (i.done)) { this.fiber = null; this.context = null; break; }
            callback(await (i.value));
        }
    }
}
