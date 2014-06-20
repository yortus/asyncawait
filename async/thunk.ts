import references = require('references');
import oldBuilder = require('../src/asyncBuilder');
import protocol = require('../src/protocols/thunk');
export = newBuilder;


var newBuilder = oldBuilder.mod<AsyncAwait.Async.ThunkBuilder>(protocol);
