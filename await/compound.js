var oldBuilder = require('../src/awaitBuilder');
var pipeline = require('../src/pipeline');


var builder = oldBuilder.derive(function (options) {
    return function compoundHandler(co, arg, allArgs) {
        //TODO: temp testing... handle allArgs too...
        if (allArgs)
            return pipeline.notHandled;
        var handlers = options.handlers || [], len = handlers.length, result = pipeline.notHandled;
        for (var i = 0; result === pipeline.notHandled && i < len; ++i)
            result = handlers[i](co, arg);
        return result;
    };
});
module.exports = builder;
//# sourceMappingURL=compound.js.map
