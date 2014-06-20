import references = require('references');
import oldBuilder = require('../../src/asyncBuilder');
import protocol = require('../../src/protocols/iterableCps');
export = newBuilder;


var newBuilder = oldBuilder.mod<AsyncAwait.Async.IterableCPSBuilder>(protocol);
