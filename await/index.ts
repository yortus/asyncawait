import references = require('references');
//TODO: temp... require('../src/extensibility').config({ handlers: [ promise.handler, cps.handler, thunk.handler, general, value ]});
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




//TODO: temp testing...
var opts = { handlers: [ promise.handler, cps.handler, thunk.handler, general, value ]};
var api: AsyncAwait.Await.API = <any> compound.derive(opts);
api.promise = promise;
api.cps = <any> cps;
api.thunk = <any> thunk;
