var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Coro = require('../coro');

var NodebackCoro = (function (_super) {
    __extends(NodebackCoro, _super);
    function NodebackCoro() {
        _super.call(this);
    }
    NodebackCoro.prototype.invoke = function (func, this_, args) {
        this.callback = args.pop();
        _super.prototype.invoke.call(this, func, this_, args).resume();
    };

    NodebackCoro.prototype.return = function (result) {
        this.callback(null, result);
    };

    NodebackCoro.prototype.throw = function (error) {
        this.callback(error);
    };
    return NodebackCoro;
})(Coro);
module.exports = NodebackCoro;
//# sourceMappingURL=nodeback.js.map
