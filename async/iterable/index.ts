import references = require('references');
import makeAsyncFunc = require('../impl/makeAsyncFunc');
import IterablePromiseProtocol = require('../impl/protocols/iterablePromise');
import Promise = require('./promise');
import CPS = require('./cps');
import Thunk = require('./thunk');
export = asyncIterable;


var asyncIterable: AsyncAwait.AsyncIterable = <any> makeAsyncFunc(IterablePromiseProtocol);
asyncIterable.promise = Promise;
asyncIterable.cps = CPS;
asyncIterable.thunk = Thunk;
