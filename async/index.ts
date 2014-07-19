import references = require('references');
import use = require('../src/use');
import promise = require('./promise');
import cps = require('./cps');
import thunk = require('./thunk');
import express = require('./express');
import stream = require('./stream');
import iterable = require('./iterable/index');
export = api;


var api: AsyncAwait.Async.API = <any> promise;
api.use = use;
api.promise = promise.derive<AsyncAwait.Async.PromiseBuilder>({});
api.cps = cps;
api.thunk = thunk;
api.express = express;
api.stream = stream;
api.iterable = iterable;
