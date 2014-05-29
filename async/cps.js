var asyncBase = require('./impl/asyncBase2');

var async = asyncBase.mod(function (resume, suspend) {
    var callback = null;
    return {
        create: function (callback_) {
            if (typeof (callback_) !== "function")
                throw new Error('Expected final argument to be a callback');
            callback = callback_;
            setImmediate(resume);
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
