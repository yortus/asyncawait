import references = require('references');
import oldBuilder = require('./cps');
export = newBuilder;


var newBuilder = oldBuilder.derive<AsyncAwait.Async.CPSBuilder>((options, cps) => ({
    return: (ctx, result) => {
        if (result === 'next') return cps.return(ctx, null);
        if (result === 'route') return cps.throw(ctx, <any> 'route');
        if (!!result) return cps.throw(ctx, new Error('unexpected return value: ' + result));
    }
}));
