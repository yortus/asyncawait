import references = require('references');
import asyncBuilder = require('../../src/asyncBuilder');
import iterablePromiseProtocol = require('../../src/protocols/iterablePromise');
import promise = require('./promise');
import cps = require('./cps');
import thunk = require('./thunk');
export = asyncIterable;


var asyncIterable: AsyncAwait.Async.IterableAPI = <any> asyncBuilder.mod(iterablePromiseProtocol);
asyncIterable.promise = promise;
asyncIterable.cps = cps;
asyncIterable.thunk = thunk;
