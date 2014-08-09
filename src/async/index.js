var asyncBuilder = require('../asyncBuilder');

//import promiseMod = require('../mods/async/promise');
var iterable = require('./iterable/index');
var extensibility = require('../extensibility');

// TODO: was...
//var api: AsyncAwait.Async.API = <any> asyncBuilder.mod(promiseMod);
//api.iterable = iterable;
var api = function () {
    var globalOptions = extensibility.options().defaults;

    //var key = globalOptions.asyncDefault || 'NEVER'; //TODO: better way to do this? See also /src/startup
    //var val = api[key] || asyncBuilder.mod(promiseMod);
    var val = globalOptions.async || asyncBuilder;

    for (var l = arguments.length, a = new Array(l), i = 0; i < l; ++i)
        a[i] = arguments[i];
    return val.apply(this, a);
};
api.mod = function mod(mod) {
    var globalOptions = extensibility.options().defaults;

    //var key = globalOptions.asyncDefault || 'NEVER'; //TODO: better way to do this? See also /src/startup
    //var val = api[key] || asyncBuilder.mod(promiseMod);
    var val = globalOptions.async || asyncBuilder;

    for (var l = arguments.length, a = new Array(l), i = 0; i < l; ++i)
        a[i] = arguments[i];
    return val.mod.apply(this, a);
};

//TODO: need to handle async.options and async.protocol as well (actually, get rid of them altogether throughout)
//TODO: temp
api.iterable = iterable;
module.exports = api;
//# sourceMappingURL=index.js.map
