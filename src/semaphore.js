//TODO add explanation here
//TODO: optimal? Is this used even if no maxConcurrency specified?
/** Enter the global semaphore. */
function enter(fn) {
    if (_avail > 0) {
        --_avail;
        fn();
    } else {
        _queued.push(fn);
    }
}
exports.enter = enter;

/** Leave the global semaphore. */
function leave() {
    if (_queued.length > 0) {
        var fn = _queued.shift();
        fn();
    } else {
        ++_avail;
    }
}
exports.leave = leave;

/** Get or set the size of the global semaphore. */
function size(n) {
    if (n) {
        _avail += (n - _size);
        _size = n;
    }
    return _size;
}
exports.size = size;

var _size = 1000000;

var _avail = 1000000;

var _queued = [];
//# sourceMappingURL=semaphore.js.map
