import references = require('references');
import promise = require('./promise');
import cps = require('./cps');
import thunk = require('./thunk');
import express = require('./express');
import stream = require('./stream');
import iterable = require('./iterable/index');
export = api;


var api: AsyncAwait.Async.API = <any> promise;
api.promise = promise.mod<AsyncAwait.Async.PromiseBuilder>({});
api.cps = cps;
api.thunk = thunk;
api.express = express;
api.stream = stream;
api.iterable = iterable;
