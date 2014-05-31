var asyncBase = require('./impl/asyncBase2');

var async = asyncBase.mod(function (base) {
    var callback = null;
    return {
        create: function (callback_) {
            var _this = this;
            if (typeof (callback_) !== "function")
                throw new Error('Expected final argument to be a callback');
            callback = callback_;
            setImmediate(function () {
                return base.resume.call(_this);
            });
        },
        return: function (result) {
            return callback(null, result);
        },
        throw: function (error) {
            return callback(error);
        }
    };
});
module.exports = async;
//# sourceMappingURL=cps.js.map
