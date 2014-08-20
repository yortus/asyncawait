import references = require('references');
import await = require('../await');
import _ = require('../util');
export = mod;


var mod = {

    name: 'await.compound',

    base: 'await.',

    override: (base, options) => {

        var variants = options.defaults.awaitVariants || [];
        var handlers = variants.map(variant => await.getProtocolFor(variant).members);

        return {
            singular: (fi, arg) => {
                var len = handlers.length, result = _.notHandled;
                for (var i = 0; result === _.notHandled && i < len; ++i) result = handlers[i].singular(fi, arg);
                return result;
            },
            variadic: (fi, args) => {
                //TODO: temp testing... handle allArgs too...
                return _.notHandled;
            },

            elements: (futures: any[], present: (err: Error, value: any, index: number) => void) => {

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
