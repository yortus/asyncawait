var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var _ = require('lodash');

var IterableCpsCoro = require('./iterable.cps');

var IterableThunkCoro = (function (_super) {
    __extends(IterableThunkCoro, _super);
    function IterableThunkCoro() {
        _super.call(this);
    }
    IterableThunkCoro.prototype.invoke = function (func, this_, args) {
        var iter = _super.prototype.invoke.call(this, func, this_, args);
        return {
            next: function () {
                return function (callback) {
                    return iter.next(callback);
                };
            },
            forEach: function (callback) {
                // Ensure that a single argument has been supplied, which is a function.
                if (arguments.length !== 1)
                    throw new Error('forEach(): expected a single argument');
                if (!_.isFunction(callback))
                    throw new Error('forEach(): expected argument to be a function');

                // Return a thunk
                return function (done) {
                    return iter.forEach(callback, done);
                };
            }
        };
    };
    return IterableThunkCoro;
})(IterableCpsCoro);
module.exports = IterableThunkCoro;
//# sourceMappingURL=iterable.thunk.js.map
