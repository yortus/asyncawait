import _refs = require('_refs');
import Fiber = require('fibers');
import Promise = require('bluebird');
import RunContext = require('./runContext');
import await = require('../await/index');
export = PromiseIterator;


/**
 * TODO: ...
 */
class PromiseIterator {

    /**
     * TODO: ...
     */
    constructor(private fiber: Fiber, private runContext: RunContext) {}

    /**
     * TODO: ...
     */
    next(): { value: Promise<any>; done: Promise<boolean> } {
        var value = Promise.defer<any>();
        var done = Promise.defer<boolean>();
        this.runContext.value = value;
        this.runContext.done = done;

        // Run the fiber until it either yields a value or completes
        this.fiber.run(this.runContext);

        return { value: value.promise, done: done.promise };
    }

    /**
     * TODO: ...
     */
    forEach(callback: (value) => void) {
        while (true) {
            var i = this.next();
            if (await (i.done)) { this.fiber = null; this.runContext = null; break; }
            callback(await (i.value));
        }
    }
}
