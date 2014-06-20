import references = require('references');
import oldBuilder = require('../../src/asyncBuilder');
import protocol = require('../../src/protocols/iterablePromise');
export = newBuilder;


var newBuilder = oldBuilder.mod<AsyncAwait.Async.IterablePromiseBuilder>(protocol);
