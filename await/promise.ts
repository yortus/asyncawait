import references = require('references');
import oldBuilder = require('../src/awaitBuilder');
import pipeline = require('../src/pipeline');
import _ = require('../src/util');
export = newBuilder;


//TODO: but overrideHandler call needs (REALLY??? check) to happen *after* user has a chance to set options
//      with config(...). So, builders must call the override...() func lazily ie when first
//      async(...) or await(...) call is made.
var newBuilder = oldBuilder.mod({

    name: 'promise',

    type: <AsyncAwait.Await.PromiseBuilder> null,

    overrideHandlers: (base, options) => ({
        singular: (co, arg) => {
            if (!_.isPromise(arg)) return pipeline.notHandled;
            arg.then(val => co.enter(null, val), co.enter);
        },
        variadic: (co, args) => {
            if (!_.isPromise(args[0])) return pipeline.notHandled;
            args[0].then(val => co.enter(null, val), co.enter);
        }
    })
});
