import references = require('references');
import _ = require('lodash');
import cpsProtocol = require('./cps');
import Protocol = AsyncAwait.Async.Protocol;
export = protocol;







var protocol: Protocol = {
    methods: (options, fallback) => {
        var methods = cpsProtocol.methods(options, fallback);
        var cpsInvoke = methods.invoke;
        methods.invoke = (co) => (callback: AsyncAwait.Callback<any>) => cpsInvoke(co, callback || nullFunc);
        return methods;
    }
}


function nullFunc() {}
