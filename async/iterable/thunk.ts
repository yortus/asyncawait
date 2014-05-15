import references = require('references');
import makeAsyncFunc = require('../impl/makeAsyncFunc');
import IterableThunkProtocol = require('../impl/protocols/iterableThunk');
export = async;


var async: AsyncAwait.AsyncIterableThunk = <any> makeAsyncFunc(IterableThunkProtocol);
