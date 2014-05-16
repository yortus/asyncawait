var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var _ = require('lodash');
var Promise = require('bluebird');
var Protocol = require('./base');

var IterablePromiseProtocol = (function (_super) {
    __extends(IterablePromiseProtocol, _super);
    function IterablePromiseProtocol(options) {
        _super.call(this);
        this.nextResolver = null;
    }
    IterablePromiseProtocol.prototype.invoke = function (func, this_, args) {
        _super.prototype.invoke.call(this, func, this_, args);
        return new AsyncIterator(this);
    };

    IterablePromiseProtocol.prototype.invokeNext = function () {
        var _this = this;
        var res = this.nextResolver = Promise.defer();
        setImmediate(function () {
            return _this.done ? res.reject(new Error('iterated past end')) : _this.resume();
        });
        return this.nextResolver.promise;
    };

    IterablePromiseProtocol.prototype.return = function (result) {
        this.done = true;
        this.nextResolver.resolve({ done: true, value: result });
    };

    IterablePromiseProtocol.prototype.throw = function (error) {
        this.nextResolver.reject(error);
    };

    IterablePromiseProtocol.prototype.yield = function (value) {
        var result = { done: false, value: value };
        this.nextResolver.resolve(result);
        this.suspend();
    };
    return IterablePromiseProtocol;
})(Protocol);

var AsyncIterator = (function () {
    function AsyncIterator(iterable) {
        this.iterable = iterable;
    }
    AsyncIterator.prototype.next = function () {
        return this.iterable.invokeNext();
    };

    AsyncIterator.prototype.forEach = function (callback) {
        var _this = this;
        if (arguments.length !== 1)
            throw new Error('forEach(): expected a single argument');
        if (!_.isFunction(callback))
            throw new Error('forEach(): expected argument to be a function');

        var result = Promise.defer();
        var stepNext = function () {
            return _this.next().then(stepResolved, function (err) {
                return result.reject(err);
            });
        };
        var stepResolved = function (item) {
            if (item.done)
                return result.resolve(item.value);
            callback(item.value);
            setImmediate(stepNext);
        };
        stepNext();
        return result.promise;
    };
    return AsyncIterator;
})();
module.exports = IterablePromiseProtocol;
//# sourceMappingURL=iterablePromise.js.map
