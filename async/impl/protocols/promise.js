var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Promise = require('bluebird');
var Protocol = require('./base');

/** Protocol for a suspendable function which returns a promise. */
var PromiseProtocol = (function (_super) {
    __extends(PromiseProtocol, _super);
    function PromiseProtocol(options) {
        _super.call(this);
    }
    PromiseProtocol.prototype.invoke = function () {
        var _this = this;
        this.resolver = Promise.defer();
        _super.prototype.invoke.call(this); //TODO: this is a no-op. Remove?
        setImmediate(function () {
            return _super.prototype.resume.call(_this);
        });
        return this.resolver.promise;
    };

    PromiseProtocol.prototype.return = function (result) {
        this.resolver.resolve(result);
    };

    PromiseProtocol.prototype.throw = function (error) {
        this.resolver.reject(error);
    };

    PromiseProtocol.prototype.yield = function (value) {
        this.resolver.progress(value);
    };
    return PromiseProtocol;
})(Protocol);
module.exports = PromiseProtocol;
//# sourceMappingURL=promise.js.map
