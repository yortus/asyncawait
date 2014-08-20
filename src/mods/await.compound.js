var await = require('../await');
var _ = require('../util');

var mod = {
    name: 'await.compound',
    base: null,
    override: function (base, options) {
        var variants = options.defaults.awaitVariants || [];
        var handlers = variants.map(function (variant) {
            return await.getProtocolFor(variant).members;
        });

        return {
            singular: function (fi, arg) {
                var len = handlers.length, result = _.notHandled;
                for (var i = 0; result === _.notHandled && i < len; ++i)
                    result = handlers[i].singular(fi, arg);
                return result;
            },
            variadic: function (fi, args) {
                //TODO: temp testing... handle allArgs too...
                return _.notHandled;
            },
            elements: function (futures, present) {
                // TODO: temp testing...
                var len = handlers.length, numberHandled = 0;
                for (var i = 0; numberHandled < len && i < len; ++i) {
                    numberHandled += handlers[i].elements(futures, present);
                }
                return numberHandled;
            }
        };
    }
};
module.exports = mod;
//# sourceMappingURL=await.compound.js.map
