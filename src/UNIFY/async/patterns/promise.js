var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Promise = require('bluebird');
var Coro = require('../coro');

var PromiseCoro = (function (_super) {
    __extends(PromiseCoro, _super);
    function PromiseCoro() {
        _super.call(this);
    }
    PromiseCoro.prototype.invoke = function (func, this_, args) {
        var _this = this;
        this.resolver = Promise.defer();
        _super.prototype.invoke.call(this, func, this_, args);
        setImmediate(function () {
            return _super.prototype.resume.call(_this);
        });
        return this.resolver.promise;
    };

    PromiseCoro.prototype.return = function (result) {
        this.resolver.resolve(result);
    };

    PromiseCoro.prototype.throw = function (error) {
        this.resolver.reject(error);
    };

    PromiseCoro.prototype.yield = function (value) {
        this.resolver.progress(value);
    };
    return PromiseCoro;
})(Coro);
module.exports = PromiseCoro;
//# sourceMappingURL=promise.js.map
