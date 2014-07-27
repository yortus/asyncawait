import references = require('references');
import oldBuilder = require('../src/awaitBuilder');
import pipeline = require('../src/pipeline');
export = newBuilder;


interface CompoundOptions {
    handlers?: AsyncAwait.Await.Handlers[];
}


var newBuilder = oldBuilder.mod({

    name: 'compound',

    overrideHandlers: (base, options) => ({
        singular: (co, arg) => {
            var handlers = options.handlers || [], len = handlers.length, result = pipeline.notHandled;
            for (var i = 0; result === pipeline.notHandled && i < len; ++i) result = handlers[i].singular(co, arg);
            return result;
        },
        variadic: (co, args) => {
            //TODO: temp testing... handle allArgs too...
            return pipeline.notHandled;
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
