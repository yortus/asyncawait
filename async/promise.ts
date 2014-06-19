import references = require('references');
import createAsyncBuilder = require('../src/createAsyncBuilder');
import promiseProtocol = require('../src/protocols/promise');
export = async;


var async = createAsyncBuilder<AsyncAwait.Async.PromiseBuilder>(promiseProtocol);
