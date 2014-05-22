var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var _ = require('lodash');
var Protocol = require('./base');

var CPSProtocol = (function (_super) {
    __extends(CPSProtocol, _super);
    function CPSProtocol(options) {
        _super.call(this);
    }
    CPSProtocol.prototype.invoke = function (callback_) {
        var _this = this;
        if (!_.isFunction(callback_))
            throw new Error('Expected final argument to be a callback');
        this.callback = callback_;
        _super.prototype.invoke.call(this);
        setImmediate(function () {
            return _super.prototype.resume.call(_this);
        });
    };

    CPSProtocol.prototype.return = function (result) {
        this.callback(null, result);
    };

    CPSProtocol.prototype.throw = function (error) {
        this.callback(error);
    };
    return CPSProtocol;
})(Protocol);
module.exports = CPSProtocol;
//# sourceMappingURL=cps.js.map
