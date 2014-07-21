import references = require('references');
import oldBuilder = require('../src/awaitBuilder');
import pipeline = require('../src/pipeline');
import _ = require('../src/util');
export = builder;


var builder = oldBuilder.derive<AsyncAwait.Await.PromiseBuilder>(
    () => function promiseHandler(co, arg, allArgs) {
        if (allArgs || !_.isPromise(arg)) return pipeline.notHandled;
        arg.then(val => co.enter(null, val), co.enter);
    }
);




//TODO: possible new style... could be similar for async builder and global mods
//TODO: call with await.make(mod), async.make(mod), config.use(mod)
//TODO: but overrideHandler call needs (REALLY??? check) to happen *after* user has a chance to set options
//      with config(...). So, builders must call the override...() func lazily ie when first
//      async(...) or await(...) call is made.
var builder2 = oldBuilder.derive<AsyncAwait.Await.PromiseBuilder>({

    name: 'promise', //TODO: this could be used for automatic type deduction, if it works

    type: <AsyncAwait.Await.PromiseBuilder> null,

    overrideHandler: (baseHandler, options) => function promiseHandler(co, arg, allArgs) {
        if (allArgs || !_.isPromise(arg)) return pipeline.notHandled;
        arg.then(val => co.enter(null, val), co.enter);
    },

    defaultOptions: {}
});
