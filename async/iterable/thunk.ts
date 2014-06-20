import references = require('references');
import oldBuilder = require('../../src/asyncBuilder');
import protocol = require('../../src/protocols/iterableThunk');
export = newBuilder;


var newBuilder = oldBuilder.mod<AsyncAwait.Async.IterableThunkBuilder>(protocol);
