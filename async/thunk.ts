import references = require('references');
import oldBuilder = require('../src/asyncBuilder');
import thunkProtocol = require('../src/protocols/thunk');
export = newBuilder;


var newBuilder = oldBuilder.mod<AsyncAwait.Async.ThunkBuilder>(thunkProtocol);
