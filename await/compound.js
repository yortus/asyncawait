var oldBuilder = require('../src/awaitBuilder');


var builder = oldBuilder.derive(function (options) {
    return function (co, args) {
        var handlers = options.handlers || [], len = handlers.length, result = false;
        for (var i = 0; result === false && i < len; ++i)
            result = handlers[i](co, args);
        return result;
    };
});
module.exports = builder;
//# sourceMappingURL=compound.js.map
