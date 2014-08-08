import references = require('references');
import asyncBuilder = require('../asyncBuilder');
import promiseMod = require('../mods/async/promise');
import iterable = require('./iterable/index');
export = api;


var api: AsyncAwait.Async.API = <any> asyncBuilder.mod(promiseMod);
api.iterable = iterable;
