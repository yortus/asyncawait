import references = require('references');
import options = require('./options');
import use = require('./use');
import Protocol = require('./protocol');
import _ = require('./util');
import fiberProtocol = require('./fiberProtocol');


//var async: AsyncAwait.AsyncAPI;
//var x = async((a: number): string => null);

//TODO: side effects!

console.log('MAIN!!!!!!!!!!!!!!!');


options({
    defaults: {
        async: 'async.promise',
        await: 'await.compound',
        awaitVariants: ['await.promise', 'await.value']
    }
});


use(require('./mods/async.promise'));
use(require('./mods/await.promise'));
use(require('./mods/await.value'));
use(require('./mods/await.compound'));



//TODO: ============================================================================================= FIBER
var baseFiberMod = require('./mods/baseline').mod;
var _fiberProtocol = new Protocol(options(), () => ({})).mod(baseFiberMod);
_.mergeProps(fiberProtocol, _fiberProtocol.members);//TODO:...
