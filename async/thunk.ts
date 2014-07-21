import references = require('references');
import oldBuilder = require('./cps');
import _ = require('../src/util');
export = newBuilder;


var newBuilder = oldBuilder.mod({

    name: 'thunk',

    type: <AsyncAwait.Async.ThunkBuilder> null,

    overrideProtocol: (cps, options) => ({
        invoke: (co) => {
            return (callback: AsyncAwait.Callback<any>) => cps.invoke(co, callback || _.empty);
        }
    })
});
