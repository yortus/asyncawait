import references = require('references');
import oldBuilder = require('./cps');
export = newBuilder;


var newBuilder = oldBuilder.mod({

    name: 'express',

    type: <AsyncAwait.Async.CPSBuilder> null,

    overrideProtocol: (cps, options) => ({
        end: (fi, error?, value?) => {
            if (error) return cps.end(fi, error);
            if (value === 'next') return cps.end(fi);
            if (value === 'route') return cps.end(fi, <any> 'route');
            if (!!value) return cps.end(fi, new Error('unexpected return value: ' + value));
        }
    })
});
