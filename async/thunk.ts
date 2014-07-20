import references = require('references');
import oldBuilder = require('./cps');
import _ = require('../src/util');
export = newBuilder;


var newBuilder = oldBuilder.derive<AsyncAwait.Async.ThunkBuilder>((cps) => ({
    invoke: (co) => {
        return (callback: AsyncAwait.Callback<any>) => cps.invoke(co, callback || _.empty);
    }
}));
