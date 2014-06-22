import references = require('references');
import oldBuilder = require('./cps');
export = newBuilder;


var newBuilder = oldBuilder.mod<AsyncAwait.Async.ThunkBuilder>({
    methods: (options, cps) => ({
        invoke: (co) => (callback: AsyncAwait.Callback<any>) => cps.invoke(co, callback || nullFunc)
    })
});


function nullFunc() { }
