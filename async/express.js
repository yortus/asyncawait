var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var CPSPRotocol = require('./cps');

var ExpressProtocol = (function (_super) {
    __extends(ExpressProtocol, _super);
    function ExpressProtocol() {
        _super.call(this);
    }
    ExpressProtocol.prototype.return = function (result) {
        if (result === 'next')
            return _super.prototype.return.call(this, null);
        if (result === 'route')
            return _super.prototype.throw.call(this, 'route');
        if (!!result)
            return _super.prototype.throw.call(this, new Error('unexpected return value: ' + result));
    };
    return ExpressProtocol;
})(CPSPRotocol);
module.exports = ExpressProtocol;
//# sourceMappingURL=express.js.map
