import references = require('references');



//TODO add explanation here
//TODO: optimal? Is this used even if no maxConcurrency specified?


/** Enter the global semaphore. */
export function enter(fn: () => void) {
    if (_avail > 0) {
        --_avail;
        fn();
    } else {
        _queued.push(fn);
    }
}

/** Leave the global semaphore. */
export function leave() {
    if (_queued.length > 0) {
        var fn = _queued.shift();
        fn();
    } else {
        ++_avail;
    }
}

/** Get or set the size of the global semaphore. */
export function size(n?: number): number {
    if (n) {
        _avail += (n - _size);
        _size = n;
    }
    return _size;
}

var _size: number = 1000000;

var _avail: number = 1000000;

var _queued: Function[] = [];
