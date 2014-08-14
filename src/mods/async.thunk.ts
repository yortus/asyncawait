import references = require('references');
import oldBuilder = require('./async.cps');
import _ = require('../util');
export = mod;


//TODO: how to indicate that this must mod async.cps??
var mod = {

    name: 'thunk',

    //TODO: add checking in extensibility.ts or somehow for this:
    base: 'cps',

    type: <AsyncAwait.Async.ThunkBuilder> null,

    override: (cps, options) => ({
        begin: (fi) => {
            return (callback: AsyncAwait.Callback<any>) => cps.begin(fi, callback || _.empty);
        }
    })
};
