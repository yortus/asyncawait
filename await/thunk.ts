import references = require('references');
import oldBuilder = require('../src/awaitBuilder');
import pipeline = require('../src/pipeline');
import _ = require('../src/util');
export = newBuilder;


var newBuilder = oldBuilder.mod({

    name: 'thunk',

    type: <AsyncAwait.Await.ThunkBuilder> null,

    overrideHandlers: (base, options) => ({
        singular: (co, arg) => {
            if (!_.isFunction(arg)) return pipeline.notHandled;
            arg(co.enter);
        },
        variadic: (co, args) => {
            if (!_.isFunction(args[0])) return pipeline.notHandled;
            args[0](co.enter);
        }
    })
});
