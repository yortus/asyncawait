import references = require('references');
import oldBuilder = require('../src/asyncBuilder');
import protocol = require('../src/protocols/stream');
export = newBuilder;


var newBuilder = oldBuilder.mod<AsyncAwait.Async.StreamBuilder>(protocol);
