var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var _ = require('lodash');
var Coro = require('../coro');

var NodebackCoro = (function (_super) {
    __extends(NodebackCoro, _super);
    function NodebackCoro() {
        _super.call(this);
    }
    NodebackCoro.prototype.invoke = function (func, this_, args) {
        var _this = this;
        this.callback = args.pop();
        if (!_.isFunction(this.callback))
            throw new Error('Expected final argument to be a callback');
        _super.prototype.invoke.call(this, func, this_, args);
        setImmediate(function () {
            return _super.prototype.resume.call(_this);
        });
    };

    NodebackCoro.prototype.return = function (result) {
        this.callback(null, result);
    };

    NodebackCoro.prototype.throw = function (error) {
        this.callback(error);
    };

    NodebackCoro.arityFor = function (func) {
        return func.length + 1;
    };
    return NodebackCoro;
})(Coro);
module.exports = NodebackCoro;
//# sourceMappingURL=nodeback.js.map
