import references = require('references');
import cpsProtocol = require('./cps');
import Protocol = AsyncAwait.Async.Protocol;
export = protocol;


var protocol: Protocol = {
    methods: (options, fallback) => {
        var methods = cpsProtocol.methods(options, fallback);
        var cpsReturn = methods.return, cpsThrow = methods.throw;
        methods.return = (co, result) => {
            if (result === 'next') return cpsReturn(co, null);
            if (result === 'route') return cpsThrow(co, <any> 'route');
            if (!!result) return cpsThrow(co, new Error('unexpected return value: ' + result));
        };
        return methods;
    }
}
