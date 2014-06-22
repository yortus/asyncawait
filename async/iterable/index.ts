import references = require('references');
import asyncBuilder = require('../../src/asyncBuilder');
import iterablePromiseProtocol = require('../../src/protocols/iterablePromise');
import promise = require('./promise');
import cps = require('./cps');
import thunk = require('./thunk');
export = iterableAPI;


var iterableAPI: AsyncAwait.Async.IterableAPI = <any> asyncBuilder.mod(iterablePromiseProtocol);
iterableAPI.promise = promise;
iterableAPI.cps = cps;
iterableAPI.thunk = thunk;
