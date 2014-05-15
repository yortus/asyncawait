import references = require('references');
import makeAsyncFunc = require('../impl/makeAsyncFunc');
import IterablePromiseProtocol = require('../impl/protocols/iterablePromise');
export = async;


var async: AsyncAwait.AsyncIterablePromise = <any> makeAsyncFunc(IterablePromiseProtocol);
