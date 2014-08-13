var assert = require('assert');
var Promise = require('bluebird');
var oldBuilder = require('../../asyncBuilder');
var _ = require('../../util');


var newBuilder = oldBuilder.mod({
    name: 'iterable.promise',
    type: null,
    override: function (base, options) {
        return ({
            begin: function (fi) {
                var ctx = fi.context = { nextResolver: null, done: false };
                var next = function () {
                    var res = ctx.nextResolver = Promise.defer();
                    if (ctx.done)
                        res.reject(new Error('iterated past end'));
                    else
                        fi.resume();
                    return ctx.nextResolver.promise;
                };
                return new AsyncIterator(next);
            },
            suspend: function (fi, error, value) {
                if (error)
                    throw error;
                fi.context.nextResolver.resolve({ done: false, value: value });
                _.yieldCurrentFiber();
            },
            end: function (fi, error, value) {
                var ctx = fi.context;
                ctx.done = true;
                if (error)
                    ctx.nextResolver.reject(error);
                else
                    ctx.nextResolver.resolve({ done: true, value: value });
            }
        });
    }
});

//TODO: also support send(), throw(), close()...
//TODO: see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators
//TODO: also for other iterable variants...
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
module.exports = newBuilder;
//# sourceMappingURL=promise.js.map
