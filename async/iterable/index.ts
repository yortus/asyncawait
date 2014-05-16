import references = require('references');
import asyncBase = require('../impl/asyncBase');
import IterablePromiseProtocol = require('../impl/protocols/iterablePromise');
import Promise = require('./promise');
import CPS = require('./cps');
import Thunk = require('./thunk');
export = asyncIterable;


var asyncIterable: AsyncAwait.AsyncIterable = <any> asyncBase.mod({ protocol: IterablePromiseProtocol });
asyncIterable.promise = Promise;
asyncIterable.cps = CPS;
asyncIterable.thunk = Thunk;
