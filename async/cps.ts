import references = require('references');
import createAsyncBuilder = require('../src/createAsyncBuilder');
import cpsProtocol = require('../src/protocols/cps');
export = async;


var async = createAsyncBuilder<AsyncAwait.Async.CPSBuilder>(cpsProtocol);
