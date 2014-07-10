import references = require('references');
import Promise = require('bluebird');
import Fiber = require('fibers');
import Extension = AsyncAwait.Extension;
export = factory;


//TODO: what if use()'d twice? Will they clash? Can we give a helpful error message?



function factory(maxConcurrency: number) {
    size(maxConcurrency);
    return (pipeline) => ({
        acquireFiber: body => {

            if (Fiber.current) return pipeline.acquireFiber(body);

            return new Promise<Fiber>((resolve: any, reject) => {
                enter(() => {
                    pipeline.acquireFiber(body).then(resolve, reject);
                });
            });
        },
        releaseFiber: fiber => {
            leave(); //TODO: only if entered...
            return pipeline.releaseFiber(fiber);
        }
    });
}


//TODO add explanation here
//TODO: optimal? Is this used even if no maxConcurrency specified?


/** Enter the global semaphore. */
function enter(fn: () => void) {
    if (_avail > 0) {
        --_avail;
        fn();
    } else {
        _queued.push(fn);
    }
}

/** Leave the global semaphore. */
function leave() {
    if (_queued.length > 0) {
        var fn = _queued.shift();
        fn();
    } else {
        ++_avail;
    }
}

/** Get or set the size of the global semaphore. */
function size(n?: number): number {
    if (n) {
        _avail += (n - _size);
        _size = n;
    }
    return _size;
}

var _size: number = 1000000;

var _avail: number = 1000000;

var _queued: Function[] = [];
