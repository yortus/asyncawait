import references = require('references');
import oldBuilder = require('../src/awaitBuilder');
import pipeline = require('../src/pipeline');
export = newBuilder;


var newBuilder = oldBuilder.mod({

    name: 'cps',

    type: <AsyncAwait.Await.CPSBuilder> null,

    overrideHandlers: (base, options) => ({
        singular: (co, arg) => {
            if (arg !== void 0) return pipeline.notHandled;
        },
        variadic: (co, args) => {
            if (args[0] !== void 0) return pipeline.notHandled;
        }
    })
});


//TODO: is pipeline the right place for this?
newBuilder.continuation = pipeline.continuation;
