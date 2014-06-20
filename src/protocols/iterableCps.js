var assert = require('assert');
var _ = require('lodash');
var transfer = require('../transfer');


var protocol = {
    methods: function () {
        return ({
            invoke: function (co) {
                co.nextCallback = null;
                co.done = false;
                var next = function (callback) {
                    co.nextCallback = callback || nullFunc;
                    co.done ? co.nextCallback(new Error('iterated past end')) : transfer(co);
                };
                return new AsyncIterator(next);
            },
            return: function (co, result) {
                co.done = true;
                co.nextCallback(null, { done: true, value: result });
            },
            throw: function (co, error) {
                co.nextCallback(error);
            },
            yield: function (co, value) {
                var result = { done: false, value: value };
                co.nextCallback(null, result);
                transfer();
            },
            finally: function (co) {
                co.nextCallback = null;
            }
        });
    }
};

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
        var done = done_ || nullFunc;
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

function nullFunc() {
}
module.exports = protocol;
//# sourceMappingURL=iterableCps.js.map
