import references = require('references');
import oldBuilder = require('./cps');
export = newBuilder;


var newBuilder = oldBuilder.mod<AsyncAwait.Async.CPSBuilder>((options, cps) => ({
    return: (co, result) => {
        if (result === 'next') return cps.return(co, null);
        if (result === 'route') return cps.throw(co, <any> 'route');
        if (!!result) return cps.throw(co, new Error('unexpected return value: ' + result));
    }
}));
