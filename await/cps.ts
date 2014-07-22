import references = require('references');
import oldBuilder = require('../src/awaitBuilder');
import pipeline = require('../src/pipeline');
export = newBuilder;


var newBuilder = oldBuilder.mod({

    name: 'cps',

    type: <AsyncAwait.Await.CPSBuilder> null,

    overrideHandler: (base, options) => function cpsHandler(co, arg, allArgs) {
        if (allArgs || arg !== void 0) return pipeline.notHandled;
    }
});


//TODO: is pipeline the right place for this?
newBuilder.continuation = pipeline.continuation;
