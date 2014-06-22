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
export = async;


var async: AsyncAwait.Async.API = <any> asyncBuilder.mod(promiseProtocol);
async.config = config;
async.promise = promise;
async.cps = cps;
async.thunk = thunk;
async.express = express;
async.stream = stream;
async.iterable = iterable;
