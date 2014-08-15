//import references = require('references');
//import assert = require('assert');
//import jointProtocol = require('../jointProtocol');
//import Protocol = require('../protocol');
//import _ = require('../util');
//import JointMod = AsyncAwait.JointMod;
////TODO: temp testing...
//var protocol: Protocol<any, any> = null;
//var _options: any = {};
///** Gets or sets global configuration values. */
//export function options(value?: any) {
//    // If called as a getter, return a reference to the options object.
//    if (arguments.length === 0) return _options;
//    // If called as a setter, delegate to use().
//    useInternal(value);
//}
//export function use(mod: JointMod) {
//    // Validate argument
//    assert(arguments.length === 1, 'use: expected a single argument');
//    assert(mod.override, "use: expected mod to have an 'override' property");
//    //TODO: restore this somehow...
//    //assert(internalState.mods.indexOf(mod) === -1, 'use: mod already registered');
//    // Delegate to private implementation.
//    return useInternal(mod);
//}
////TODO: bring this in line with async's createModMethod
///** Registers the specified mod and adds its default options to current config. */
//function useInternal(mod: JointMod) {
//    // Reset everything.
//    //TODO: was... resetAll();
//    if (jointProtocol.shutdown) jointProtocol.shutdown();
//    protocol = protocol.mod(mod);
//    _.mergeProps(_options, protocol.options);
//    _.mergeProps(jointProtocol, protocol.members);
//    //TODO: startup...
//    if (jointProtocol.startup) jointProtocol.startup();
//}
////TODO: ...
//export function useDefaults() {
//    //TODO: ...
//    resetAll();
//    // TODO: apply the default mods.
//    var defaultMods = _options.defaults.mods;
//    defaultMods.forEach(mod => use(mod));
//}
////TODO: doc...
///** Resets ... */
//function resetAll() {
//    // Reset and restore the joint protocol to its default state.
//    if (jointProtocol.shutdown) jointProtocol.shutdown();
//    _.mergeProps(jointProtocol, {
//        acquireFiber: null,
//        releaseFiber: null,
//        setFiberTarget: null,
//        startup: null,
//        shutdown: null
//    });
//    // Clear all options, except anything in the the 'defaults' key.
//    var defaults = _options.defaults;
//    _options = { defaults: defaults };
//    protocol = new Protocol(_options, () => {});
//}
////TODO: temp testing...
//// TODO: define these in a separate file. Perhaps as part of joint protocol?
//var asyncBuilder = require('../async/builder');
//var promiseMod = require('../mods/async.promise');
//_options.defaults = {
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
//    async: asyncBuilder.mod(promiseMod),
//    await: null
//};
//useDefaults();
//# sourceMappingURL=index.js.map
