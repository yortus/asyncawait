var oldBuilder = require('../../src/asyncBuilder');
var assert = require('assert');
var Promise = require('bluebird');
var _ = require('../../src/util');

var builder = oldBuilder.derive(function () {
    return ({
        invoke: function (co) {
            var ctx = co.context = {
                nextResolver: null,
                done: false
            };
            var next = function () {
                var res = ctx.nextResolver = Promise.defer();
                ctx.done ? res.reject(new Error('iterated past end')) : co.enter();
                return ctx.nextResolver.promise;
            };
            return new AsyncIterator(next);
        },
        return: function (ctx, result) {
            ctx.done = true;
            ctx.nextResolver.resolve({ done: true, value: result });
        },
        throw: function (ctx, error) {
            ctx.nextResolver.reject(error);
        },
        yield: function (ctx, value) {
            var result = { done: false, value: value };
            ctx.nextResolver.resolve(result);
        }
    });
});

var AsyncIterator = (function () {
    function AsyncIterator(next) {
        this.next = next;
    }
    AsyncIterator.prototype.forEach = function (callback) {
        var _this = this;
        // Ensure that a single argument has been supplied, which is a function.
        assert(arguments.length === 1, 'forEach(): expected a single argument');
        assert(_.isFunction(callback), 'forEach(): expected argument to be a function');

        // Asynchronously call next() until done.
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
module.exports = builder;
//# sourceMappingURL=promise.js.map
