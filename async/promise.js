var Promise = require('bluebird');
var asyncBase = require('./impl/asyncBase2');


var P = (function () {
    function P(resume, suspend) {
        this.resume = resume;
        this.suspend = suspend;
        this.resolver = Promise.defer();
    }
    P.prototype.create = function () {
        setImmediate(this.resume);
        return this.resolver.promise;
    };
    P.prototype.delete = function () {
    };
    P.prototype.return = function (result) {
        this.resolver.resolve(result);
    };
    P.prototype.throw = function (error) {
        this.resolver.reject(error);
    };
    P.prototype.yield = function (value) {
        this.resolver.progress(value);
    };
    return P;
})();

var async = asyncBase.mod(function (resume, suspend) {
    return new P(resume, suspend);
});
module.exports = async;
//# sourceMappingURL=promise.js.map
