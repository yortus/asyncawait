import references = require('references');
import oldBuilder = require('./cps');
import _ = require('../src/util');
export = newBuilder;


var newBuilder = oldBuilder.mod<AsyncAwait.Async.ThunkBuilder>((options, cps) => ({
    invoke: (co) => (callback: AsyncAwait.Callback<any>) => cps.invoke(co, callback || _.empty)
}));
