var options = require('./options');
var use = require('./use');
var Protocol = require('./protocol');
var _ = require('./util');
var fiberProtocol = require('./fiberProtocol');

//var async: AsyncAwait.AsyncAPI;
//var x = async((a: number): string => null);
//TODO: side effects!
options({
    defaults: {
        async: 'async.promise',
        await: 'await.compound',
        awaitVariants: [
            'await.promise',
            'await.cps',
            'await.thunk',
            'await.value'
        ]
    }
});

use(require('./mods/async.promise'));
use(require('./mods/await.promise'));
use(require('./mods/await.cps'));
use(require('./mods/await.thunk'));
use(require('./mods/await.value'));
use(require('./mods/await.compound'));

//TODO: ============================================================================================= FIBER
var baseFiberMod = require('./mods/baseline').mod;
var _fiberProtocol = new Protocol(options(), function () {
    return ({});
}).mod(baseFiberMod);
_.mergeProps(fiberProtocol, _fiberProtocol.members); //TODO:...
//# sourceMappingURL=main.js.map
