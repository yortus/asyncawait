var oldBuilder = require('../../src/asyncBuilder');
var assert = require('assert');
var Promise = require('bluebird');
var _ = require('lodash');
var transfer = require('../../src/transfer');

var builder = oldBuilder.mod({
    methods: function () {
        return ({
            invoke: function (co) {
                co.nextResolver = null;
                co.done = false;
                var next = function () {
                    var res = co.nextResolver = Promise.defer();
                    co.done ? res.reject(new Error('iterated past end')) : transfer(co);
                    return co.nextResolver.promise;
                };
                return new AsyncIterator(next);
            },
            return: function (co, result) {
                co.done = true;
                co.nextResolver.resolve({ done: true, value: result });
            },
            throw: function (co, error) {
                co.nextResolver.reject(error);
            },
            yield: function (co, value) {
                var result = { done: false, value: value };
                co.nextResolver.resolve(result);
                transfer();
            },
            finally: function (co) {
                co.nextResolver = null;
            }
        });
    }
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
