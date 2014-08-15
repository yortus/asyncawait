import references = require('references');
import oldBuilder = require('../awaitBuilder');
import _ = require('../util');
export = newBuilder;


interface CompoundOptions {
    handlers?: AsyncAwait.Await.AwaitProtocol[];
}


var newBuilder = oldBuilder.mod({

    name: 'compound',

    override: (base, options) => ({
        singular: (fi, arg) => {
            var handlers = options.handlers || [], len = handlers.length, result = _.notHandled;
            for (var i = 0; result === _.notHandled && i < len; ++i) result = handlers[i].singular(fi, arg);
            return result;
        },
        variadic: (fi, args) => {
            //TODO: temp testing... handle allArgs too...
            return _.notHandled;
        },

        elements: (futures: any[], present: (err: Error, value: any, index: number) => void) => {

            // TODO: temp testing...
            var handlers = options.handlers || [], len = handlers.length, numberHandled = 0;
            for (var i = 0; numberHandled < len && i < len; ++i) {
                numberHandled += handlers[i].elements(futures, present);
            }
            return numberHandled;
        }
    })
});
