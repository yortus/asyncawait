import references = require('references');
import oldBuilder = require('./cps');
import _ = require('../src/util');
export = newBuilder;


var newBuilder = oldBuilder.mod({

    name: 'thunk',

    type: <AsyncAwait.Async.ThunkBuilder> null,

    overrideProtocol: (cps, options) => ({
        begin: (fi) => {
            return (callback: AsyncAwait.Callback<any>) => cps.begin(fi, callback || _.empty);
        }
    })
});
