var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var NodebackCoro = require('./nodeback');

var ThunkCoro = (function (_super) {
    __extends(ThunkCoro, _super);
    function ThunkCoro() {
        _super.call(this);
    }
    ThunkCoro.prototype.invoke = function (func, this_, args) {
        var _this = this;
        return function (callback) {
            args.push(callback || nullFunc);
            _super.prototype.invoke.call(_this, func, this_, args);
        };
    };

    ThunkCoro.arityFor = function (func) {
        return func.length;
    };
    return ThunkCoro;
})(NodebackCoro);

function nullFunc() {
}
module.exports = ThunkCoro;
//# sourceMappingURL=thunk.js.map
