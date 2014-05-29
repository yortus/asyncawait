var _ = require('lodash');
var asyncBase = require('./impl/asyncBase2');


var CPS = (function () {
    function CPS(resume, suspend) {
        this.resume = resume;
        this.suspend = suspend;
        this.callback = null;
    }
    CPS.prototype.create = function (callback_) {
        if (!_.isFunction(callback_))
            throw new Error('Expected final argument to be a callback');
        this.callback = callback_;
        setImmediate(this.resume);
    };
    CPS.prototype.delete = function () {
    };
    CPS.prototype.return = function (result) {
        this.callback(null, result);
    };
    CPS.prototype.throw = function (error) {
        this.callback(error);
    };
    CPS.prototype.yield = function (value) {
    };
    return CPS;
})();

var async = asyncBase.mod(function (resume, suspend) {
    return new CPS(resume, suspend);
});
module.exports = async;
//# sourceMappingURL=cps.js.map
