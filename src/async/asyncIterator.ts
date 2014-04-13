import _refs = require('_refs');
import Fiber = require('fibers');
import Promise = require('bluebird');
import RunContext = require('./runContext');
import await = require('../await/index');
export = AsyncIterator;


/**
 * TODO: ...
 */
class AsyncIterator {

    /**
     * TODO: ...
     */
    constructor(private fiber: Fiber, private runContext: RunContext) {}

    /**
     * TODO: ...
     */
    next() {
        if (this.runContext.options.acceptsCallback) {
            var callback = arguments[0];
            this.runContext.callback = callback;
        }
        if (this.runContext.options.returnsPromise) {
            var resolver = Promise.defer<any>();
            this.runContext.resolver = resolver;
        }

        // Run the fiber until it either yields a value or completes.
        this.fiber.run(this.runContext);

        // Return the appropriate value.
        return this.runContext.options.returnsPromise ? resolver.promise : undefined;
    }

    /**
     * TODO: ...
     */
    forEach(callback: (value) => void) {
        //TODO: can't use await in here! We may -not- be in a fiber
        while (true) {
            var i = await (this.next());
            if (i.done) break;
            callback(i.value);
        }
    }
}
