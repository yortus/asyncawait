var oldBuilder = require('../src/awaitBuilder');


var builder = oldBuilder.mod(function (options) {
    return function (expr, resume) {
        var handlers = options.handlers || [], len = handlers.length, result = false;
        for (var i = 0; result === false && i < len; ++i)
            result = handlers[i](expr, resume);
        return result;
    };
});
module.exports = builder;
//# sourceMappingURL=compound.js.map
