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
    next(): Promise<{ value?: any; done: boolean; }> {
        var nextValue = Promise.defer<any>();
        this.runContext.resolver = nextValue;

        // Run the fiber until it either yields a value or completes
        this.fiber.run(this.runContext);

        return nextValue.promise;
    }

    /**
     * TODO: ...
     */
    forEach(callback: (value) => void) {
        while (true) {
            var i = await (this.next());
            if (i.done) break;
            callback(i.value);
        }
    }
}
