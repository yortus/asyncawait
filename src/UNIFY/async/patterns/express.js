var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var NodebackCoro = require('./nodeback');

var ExpressCoro = (function (_super) {
    __extends(ExpressCoro, _super);
    function ExpressCoro() {
        _super.call(this);
    }
    ExpressCoro.prototype.return = function (result) {
        if (result === 'next')
            return _super.prototype.return.call(this, null);
        if (result === 'route')
            return _super.prototype.throw.call(this, 'route');
        if (!!result)
            return _super.prototype.throw.call(this, new Error('unexpected return value: ' + result));
    };
    return ExpressCoro;
})(NodebackCoro);
module.exports = ExpressCoro;
//# sourceMappingURL=express.js.map
