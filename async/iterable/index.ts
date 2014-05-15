import references = require('references');
import makeAsyncFunc = require('../impl/makeAsyncFunc');
import Promise = require('./promise');
import CPS = require('./cps');
import Thunk = require('./thunk');
export = asyncIterable;


var asyncIterable: AsyncAwait.AsyncIterable = <any> makeAsyncFunc(Promise);
asyncIterable.promise = <any> makeAsyncFunc(Promise);
asyncIterable.cps = <any> makeAsyncFunc(CPS);
asyncIterable.thunk = <any> makeAsyncFunc(Thunk);
