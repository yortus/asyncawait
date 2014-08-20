import references = require('references');
import _ = require('../util');
export = mod;


var mod = {

    name: 'async.thunk',

    base: 'async.cps',

    override: (cps, options) => ({
        begin: (fi) => {
            return (callback: AsyncAwait.Callback<any>) => cps.begin(fi, callback || _.empty);
        }
    })
};
