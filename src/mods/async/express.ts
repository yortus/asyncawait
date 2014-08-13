import references = require('references');
export = mod;


//TODO: how to indicate that this must mod async.cps??
var mod = {

    name: 'express',

    //TODO: add checking in extensibility.ts or somehow for this:
    base: 'cps',

    type: <AsyncAwait.Async.CPSBuilder> null,

    override: (cps, options) => ({
        end: (fi, error?, value?) => {
            if (error) return cps.end(fi, error);
            if (value === 'next') return cps.end(fi);
            if (value === 'route') return cps.end(fi, <any> 'route');
            if (!!value) return cps.end(fi, new Error('unexpected return value: ' + value));
        }
    })
};
