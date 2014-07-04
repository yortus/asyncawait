import references = require('references');
import builder = require('../src/awaitBuilder');
import general = require('./general');
import promise = require('./promise');
import cps = require('./cps');
import thunk = require('./thunk');
export = api;



//TOSO: temp testing...
import compound = require('./compound');
var noop = (expr, resume) => resume(null, expr);




var api: AsyncAwait.Await.API = <any> compound.mod({ handlers: [ promise.handler, thunk.handler, general, noop ]});
api.promise = promise;
api.cps = <any> cps;
api.thunk = <any> thunk;
