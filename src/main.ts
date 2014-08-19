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
        await: 'await.promise'
    }
});


var mod = require('./mods/async.promise');
use(mod);
var mod = require('./mods/await.promise');
use(mod);



//TODO: ============================================================================================= FIBER
var baseFiberMod = require('./mods/baseline').mod;
var _fiberProtocol = new Protocol(options(), () => ({})).mod(baseFiberMod);
_.mergeProps(fiberProtocol, _fiberProtocol.members);//TODO:...
