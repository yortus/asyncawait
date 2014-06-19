var transfer = require('../transfer');

var cpsProtocol = {
    invoke: function (co, callback) {
        if (typeof (callback) !== "function")
            throw new Error('Expected final argument to be a callback');
        co.callback = callback;
        transfer(co);
    },
    return: function (co, result) {
        return co.callback(null, result);
    },
    throw: function (co, error) {
        return co.callback(error);
    },
    finally: function (co) {
        co.callback = null;
    }
};
module.exports = cpsProtocol;
//# sourceMappingURL=cps.js.map
