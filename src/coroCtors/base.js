
var CoroutineBase = (function () {
    function CoroutineBase(proc) {
        this._proc = proc;
        this._fiber = null;
    }
    CoroutineBase.prototype.invoke = function () {
        return this;
    };

    CoroutineBase.prototype.dispose = function () {
    };

    CoroutineBase.prototype.return = function (result) {
    };

    CoroutineBase.prototype.throw = function (error) {
    };

    CoroutineBase.prototype.yield = function (value) {
    };
    return CoroutineBase;
})();
module.exports = CoroutineBase;
//# sourceMappingURL=base.js.map
