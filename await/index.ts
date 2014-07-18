import references = require('references');
import builder = require('../src/awaitBuilder');
import general = require('./general');
import promise = require('./promise');
import cps = require('./cps');
import thunk = require('./thunk');
export = api;



//TODO: temp testing...
import compound = require('./compound');
var value = function valueHandler(co, arg, allArgs) {
    setImmediate(() => {
        co.enter(null, arg);
    });
}




var api: AsyncAwait.Await.API = <any> compound.derive({ handlers: [ promise.handler, cps.handler, thunk.handler, general, value ]});
api.promise = promise;
api.cps = <any> cps;
api.thunk = <any> thunk;
