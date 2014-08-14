var assert = require('assert');
var _ = require('../util');

var mod = {
    name: 'iterable.cps',
    type: null,
    override: function (base, options) {
        return ({
            begin: function (fi) {
                var ctx = fi.context = { nextCallback: null, done: false };
                var next = function (callback) {
                    ctx.nextCallback = callback || _.empty;
                    if (ctx.done)
                        ctx.nextCallback(new Error('iterated past end'));
                    else
                        fi.resume();
                };
                return new AsyncIterator(next);
            },
            suspend: function (fi, error, value) {
                if (error)
                    throw error;
                fi.context.nextCallback(null, { done: false, value: value });
                _.yieldCurrentFiber();
            },
            end: function (fi, error, value) {
                var ctx = fi.context;
                ctx.done = true;
                if (error)
                    ctx.nextCallback(error);
                else
                    ctx.nextCallback(null, { done: true, value: value });
            }
        });
    }
};

//TODO: also support send(), throw(), close()...
//TODO: see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators
//TODO: also for other iterable variants...
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
module.exports = mod;
//# sourceMappingURL=async.iterable.cps.js.map
