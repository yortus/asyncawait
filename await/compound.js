var oldBuilder = require('../src/awaitBuilder');
var pipeline = require('../src/pipeline');

var newBuilder = oldBuilder.mod({
    name: 'compound',
    overrideHandlers: function (base, options) {
        return ({
            singular: function (co, arg) {
                var handlers = options.handlers || [], len = handlers.length, result = pipeline.notHandled;
                for (var i = 0; result === pipeline.notHandled && i < len; ++i)
                    result = handlers[i].singular(co, arg);
                return result;
            },
            variadic: function (co, args) {
                //TODO: temp testing... handle allArgs too...
                return pipeline.notHandled;
            },
            elements: function (futures, present) {
                // TODO: temp testing...
                var handlers = options.handlers || [], len = handlers.length, numberHandled = 0;
                for (var i = 0; numberHandled < len && i < len; ++i) {
                    numberHandled += handlers[i].elements(futures, present);
                }
                return numberHandled;
            }
        });
    }
});
module.exports = newBuilder;
//# sourceMappingURL=compound.js.map
