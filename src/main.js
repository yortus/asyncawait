var options = require('./options');
var use = require('./use');

//TODO: ...
function restoreDefaults() {
    //TODO:...
    //options.clear();
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

    use(require('./mods/fiberPool'));

    use(require('./mods/callbacks'));
    use(require('./mods/express'));
    use(require('./mods/promises'));
    use(require('./mods/streams'));
    use(require('./mods/thunks'));

    use(require('./mods/async.iterable'));
    use(require('./mods/async.iterable.cps'));
    use(require('./mods/async.iterable.promise'));
    use(require('./mods/async.iterable.thunk'));
    use(require('./mods/await.value'));
    use(require('./mods/await.compound'));
}
exports.restoreDefaults = restoreDefaults;

//TODO: side effects!
exports.restoreDefaults();
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
//# sourceMappingURL=main.js.map
