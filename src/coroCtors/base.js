
var CoroutineBase = (function () {
    function CoroutineBase(proc) {
        this._proc = proc;
        this._fiber = null;
    }
    CoroutineBase.prototype.invoke = function () {
        return this;
    };

    CoroutineBase.prototype.return = function (result) {
    };

    CoroutineBase.prototype.throw = function (error) {
    };

    CoroutineBase.prototype.yield = function (value) {
    };

    CoroutineBase.prototype.finally = function () {
    };
    return CoroutineBase;
})();
module.exports = CoroutineBase;
//# sourceMappingURL=base.js.map
