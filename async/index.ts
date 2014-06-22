import references = require('references');
import asyncBuilder = require('../src/asyncBuilder');
import promiseProtocol = require('../src/protocols/promise');
import config = require('../src/asyncConfig');
import promise = require('./promise');
import cps = require('./cps');
import thunk = require('./thunk');
import express = require('./express');
import stream = require('./stream');
import iterable = require('./iterable/index');
export = api;


var api: AsyncAwait.Async.API = <any> asyncBuilder.mod(promiseProtocol);
api.config = config;
api.promise = promise;
api.cps = cps;
api.thunk = thunk;
api.express = express;
api.stream = stream;
api.iterable = iterable;
