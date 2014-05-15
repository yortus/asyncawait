import references = require('references');
import makeAsyncFunc = require('./impl/makeAsyncFunc');
import ThunkProtocol = require('./impl/protocols/thunk');
export = async;


var async: AsyncAwait.AsyncThunk = <any> makeAsyncFunc(ThunkProtocol);
