import references = require('references');
import oldBuilder = require('../src/asyncBuilder');
import cpsProtocol = require('../src/protocols/cps');
export = newBuilder;


var newBuilder = oldBuilder.mod<AsyncAwait.Async.CPSBuilder>(cpsProtocol);
