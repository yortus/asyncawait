import references = require('references');
import asyncBuilder = require('../asyncBuilder');
import promiseMod = require('../mods/async/promise');
//import cps = require('./cps');
//import thunk = require('./thunk');
//import express = require('./express');
import stream = require('./stream');
import iterable = require('./iterable/index');
export = api;


var api: AsyncAwait.Async.API = <any> asyncBuilder.mod(promiseMod);
//api.cps = cps;
//api.thunk = thunk;
//api.express = express;
api.stream = stream;
api.iterable = iterable;
