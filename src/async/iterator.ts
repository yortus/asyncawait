import _refs = require('_refs');
import Fiber = require('fibers');
import Promise = require('bluebird');
import Context = require('./context');
import await = require('../await/index');
export = Iterator;


/**
 * TODO: ...
 */
class Iterator {

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
