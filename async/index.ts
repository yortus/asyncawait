import references = require('references');
import startup = require('../src/startup');
import promisesMod = require('../src/mods/promises');
import cps = require('./cps');
import thunk = require('./thunk');
import express = require('./express');
import stream = require('./stream');
import iterable = require('./iterable/index');
export = api;


//TODO: testing...
startup.go();


var api: AsyncAwait.Async.API = <any> promisesMod.createAsyncBuilder();
api.cps = cps;
api.thunk = thunk;
api.express = express;
api.stream = stream;
api.iterable = iterable;
