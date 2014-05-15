import references = require('references');
import makeAsyncFunc = require('./impl/makeAsyncFunc');
import PromiseProtocol = require('./impl/protocols/promise');
export = async;


var async: AsyncAwait.AsyncPromise = <any> makeAsyncFunc(PromiseProtocol);
