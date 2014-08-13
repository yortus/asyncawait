import references = require('references');
import awaitBuilder = require('../awaitBuilder');
import promiseMod = require('../mods/await/promise');
import cpsMod = require('../mods/await/cps');
import thunkMod = require('../mods/await/thunk');
export = api;


//TODO: temp testing...
import compound = require('./compound');
var value = {
    singular: (fi, arg) => {
        setImmediate(() => { fi.resume(null, arg); });
    },
    variadic: (fi, args) => {
        setImmediate(() => { fi.resume(null, args[0]); });
    },
    elements: () => 0
};




//TODO: temp testing...
var promise = awaitBuilder.mod(promiseMod);
var cps = awaitBuilder.mod(cpsMod);
var thunk = awaitBuilder.mod(thunkMod);
var opts = { handlers: [ promise.handlers, cps.handlers, thunk.handlers, value ]};
var api: AsyncAwait.Await.API = <any> compound.mod({ defaults: opts });//TODO: review awkward syntax, just want to pass opts
