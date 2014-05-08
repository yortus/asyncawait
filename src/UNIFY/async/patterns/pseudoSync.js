var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var PromiseIdiom = require('./promise');
var await = require('../../await/index');

var PseudoSyncIdiom = (function (_super) {
    __extends(PseudoSyncIdiom, _super);
    function PseudoSyncIdiom() {
        _super.call(this);
    }
    PseudoSyncIdiom.prototype.invoke = function (func, this_, args) {
        return await(_super.prototype.invoke.call(this, func, this_, args));
    };
    return PseudoSyncIdiom;
})(PromiseIdiom);
module.exports = PseudoSyncIdiom;
//# sourceMappingURL=pseudoSync.js.map
