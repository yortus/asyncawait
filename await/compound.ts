import references = require('references');
import oldBuilder = require('../src/awaitBuilder');
import jointProtocol = require('../src/jointProtocol');
export = newBuilder;


interface CompoundOptions {
    handlers?: AsyncAwait.Await.Handlers[];
}


var newBuilder = oldBuilder.mod({

    name: 'compound',

    overrideHandlers: (base, options) => ({
        singular: (fi, arg) => {
            var handlers = options.handlers || [], len = handlers.length, result = jointProtocol.notHandled;
            for (var i = 0; result === jointProtocol.notHandled && i < len; ++i) result = handlers[i].singular(fi, arg);
            return result;
        },
        variadic: (fi, args) => {
            //TODO: temp testing... handle allArgs too...
            return jointProtocol.notHandled;
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
