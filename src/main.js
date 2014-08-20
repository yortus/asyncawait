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

use(require('./mods/promises'));
use(require('./mods/async.cps'));
use(require('./mods/async.express'));
use(require('./mods/async.iterable'));
use(require('./mods/async.iterable.cps'));
use(require('./mods/async.iterable.promise'));
use(require('./mods/async.iterable.thunk'));
use(require('./mods/async.thunk'));
use(require('./mods/async.stream'));
use(require('./mods/await.cps'));
use(require('./mods/await.thunk'));
use(require('./mods/await.value'));
use(require('./mods/await.compound'));

//TODO: from old code...
//    mods: [
//        require('../mods/baseline').mod, //TODO: treat this differently (builtin), then also dont need startup/shutdown guards
//        require('../mods/fibersHotfix169').mod,
//        require('../mods/fiberPool').mod,
//        require('../mods/maxSlots').mod,
//        require('../mods/cpsKeyword').mod,
//        require('../mods/promises').mod,
//        require('../mods/callbacks').mod,
//        require('../mods/thunks').mod,
//        require('../mods/streams').mod,
//        require('../mods/express').mod,
//        require('../mods/iterables').mod,
//    ],
//TODO: ============================================================================================= FIBER
var baseFiberMod = require('./mods/baseline').mod;
var _fiberProtocol = new Protocol(options(), function () {
    return ({});
}).mod(baseFiberMod);
_.mergeProps(fiberProtocol, _fiberProtocol.members); //TODO:...
//# sourceMappingURL=main.js.map
