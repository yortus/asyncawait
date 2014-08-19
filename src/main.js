var options = require('./options');
var use = require('./use');
var Protocol = require('./protocol');
var _ = require('./util');
var fiberProtocol = require('./fiberProtocol');

//var async: AsyncAwait.AsyncAPI;
//var x = async((a: number): string => null);
//TODO: side effects!
console.log('MAIN!!!!!!!!!!!!!!!');

options({
    defaults: {
        async: 'async.promise'
    }
});

var mod = require('./mods/async.promise');
use(mod);

//TODO: ============================================================================================= FIBER
var baseFiberMod = require('./mods/baseline').mod;
var _fiberProtocol = new Protocol(options(), function () {
    return ({});
}).mod(baseFiberMod);
_.mergeProps(fiberProtocol, _fiberProtocol.members); //TODO:...
//# sourceMappingURL=main.js.map
