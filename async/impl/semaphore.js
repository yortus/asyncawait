function enter(fn) {
    if (_avail > 0) {
        --_avail;
        fn();
    } else {
        _queued.push(fn);
    }
}
exports.enter = enter;

function leave() {
    if (_queued.length > 0) {
        var fn = _queued.pop();
        fn();
    } else {
        ++_avail;
    }
}
exports.leave = leave;

function size(n) {
    if (n) {
        _avail += (n - _size);
        _size = n;
    }
    return this._size;
}
exports.size = size;

var _size = 1000000;

var _avail = 1000000;

var _queued = [];
//# sourceMappingURL=semaphore.js.map
