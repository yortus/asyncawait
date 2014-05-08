var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var NodebackIdiom = require('./nodeback');

var ThunkIdiom = (function (_super) {
    __extends(ThunkIdiom, _super);
    function ThunkIdiom() {
        _super.call(this);
    }
    ThunkIdiom.prototype.invoke = function (func, this_, args) {
        var _this = this;
        return function (callback) {
            args.push(callback);
            _super.prototype.invoke.call(_this, func, this_, args);
        };
    };

    ThunkIdiom.arityFor = function (func) {
        return func.length;
    };
    return ThunkIdiom;
})(NodebackIdiom);
module.exports = ThunkIdiom;
//# sourceMappingURL=thunk.js.map
