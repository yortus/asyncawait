var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var await = require('asyncawait/await');
var IterableCoro = require('./iterable');

var IterableResultCoro = (function (_super) {
    __extends(IterableResultCoro, _super);
    function IterableResultCoro() {
        _super.call(this);
    }
    IterableResultCoro.prototype.invoke = function (func, this_, args) {
        var iter = _super.prototype.invoke.call(this, func, this_, args);
        return {
            next: function () {
                return await(iter.next());
            },
            forEach: function (callback) {
                return await(iter.forEach(callback));
            }
        };
    };
    return IterableResultCoro;
})(IterableCoro);
module.exports = IterableResultCoro;
//# sourceMappingURL=iterable.result.js.map
