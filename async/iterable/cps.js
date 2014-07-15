var assert = require('assert');
var oldBuilder = require('../../src/asyncBuilder');
var _ = require('../../src/util');

var builder = oldBuilder.derive(function () {
    return ({
        invoke: function (co) {
            var ctx = co.context = {
                nextCallback: null,
                done: false
            };
            var next = function (callback) {
                ctx.nextCallback = callback || _.empty;
                ctx.done ? ctx.nextCallback(new Error('iterated past end')) : co.enter();
            };
            return new AsyncIterator(next);
        },
        return: function (ctx, result) {
            ctx.done = true;
            ctx.nextCallback(null, { done: true, value: result });
        },
        throw: function (ctx, error) {
            ctx.nextCallback(error);
        },
        yield: function (ctx, value) {
            var result = { done: false, value: value };
            ctx.nextCallback(null, result);
        }
    });
});

var AsyncIterator = (function () {
    function AsyncIterator(next) {
        this.next = next;
    }
    AsyncIterator.prototype.forEach = function (callback, done_) {
        var _this = this;
        // Ensure at least one argument has been supplied, which is a function.
        assert(arguments.length >= 1, 'forEach(): expected at least one argument');
        assert(_.isFunction(callback), 'forEach(): expected argument to be a function');

        // Asynchronously call next() until done.
        var done = done_ || _.empty;
        var stepNext = function () {
            return _this.next(function (err, item) {
                return err ? done(err) : stepResolved(item);
            });
        };
        var stepResolved = function (item) {
            if (item.done)
                return done(null, item.value);
            callback(item.value);
            setImmediate(stepNext);
        };
        stepNext();
    };
    return AsyncIterator;
})();
module.exports = builder;
//# sourceMappingURL=cps.js.map
