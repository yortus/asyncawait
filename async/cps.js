var _ = require('lodash');
var asyncBase = require('./impl/asyncBase2');


var async = asyncBase.mod(function (resume, suspend) {
    var callback;
    var result = {
        create: function (callback_) {
            if (!_.isFunction(callback_))
                throw new Error('Expected final argument to be a callback');
            callback = callback_;
            setImmediate(resume);
        },
        delete: function () {
        },
        return: function (result) {
            return callback(null, result);
        },
        throw: function (error) {
            return callback(error);
        },
        yield: function (value) {
        }
    };
    return result;
});
module.exports = async;
//# sourceMappingURL=cps.js.map
