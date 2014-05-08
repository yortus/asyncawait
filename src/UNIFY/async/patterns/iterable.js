var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Promise = require('bluebird');
var Coro = require('../coro');

var IterableCoro = (function (_super) {
    __extends(IterableCoro, _super);
    function IterableCoro() {
        _super.call(this);
        this.nextResolver = null;
    }
    IterableCoro.prototype.invoke = function (func, this_, args) {
        _super.prototype.invoke.call(this, func, this_, args);
        return new AsyncIterator(this);
    };

    IterableCoro.prototype.invokeNext = function (callback) {
        this.nextResolver = Promise.defer();
        this.resume();
        return this.nextResolver.promise;
    };

    IterableCoro.prototype.return = function (result) {
        this.nextResolver.resolve({ done: true, value: result });
    };

    IterableCoro.prototype.throw = function (error) {
        this.nextResolver.reject(error);
    };

    IterableCoro.prototype.yield = function (value) {
        var result = { done: false, value: value };
        this.nextResolver.resolve(result);
        this.suspend();
    };
    return IterableCoro;
})(Coro);

//TODO: catch more errors - eg re-iteration, next after done, etc
var AsyncIterator = (function () {
    function AsyncIterator(iterable) {
        this.iterable = iterable;
    }
    AsyncIterator.prototype.next = function (callback) {
        return this.iterable.invokeNext(callback);
    };

    AsyncIterator.prototype.forEach = function (callback) {
        var _this = this;
        var result = Promise.defer();
        var stepResolved = function (item) {
            if (item.done)
                return result.resolve(null);
            callback(item.value);
            setImmediate(function () {
                return _this.next().then(stepResolved, function (err) {
                    return result.reject(err);
                });
            });
        };
        this.next().then(stepResolved, function (err) {
            return result.reject(err);
        });
        return result.promise;
    };
    return AsyncIterator;
})();
module.exports = IterableCoro;
//# sourceMappingURL=iterable.js.map
