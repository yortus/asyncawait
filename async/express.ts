import references = require('references');
import oldBuilder = require('./cps');
export = newBuilder;


var newBuilder = oldBuilder.mod({

    name: 'express',

    type: <AsyncAwait.Async.CPSBuilder> null,

    overrideProtocol: (cps, options) => ({
        return: (ctx, result) => {
            if (result === 'next') return cps.return(ctx, null);
            if (result === 'route') return cps.throw(ctx, <any> 'route');
            if (!!result) return cps.throw(ctx, new Error('unexpected return value: ' + result));
        }
    })
});
