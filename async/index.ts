import references = require('references');
import makeAsyncFunc = require('./impl/makeAsyncFunc');
import Protocol = require('./impl/protocol');
import Promise = require('./promise');
import CPS = require('./cps');
import Thunk = require('./thunk');
import Stream = require('./stream');
import Express = require('./express');
import Iterable = require('./iterable/index');
export = async;


var async: AsyncAwait.Async = <any> makeAsyncFunc(Promise);
async.promise = <any> makeAsyncFunc(Promise);
async.cps = <any> makeAsyncFunc(CPS);
async.thunk = <any> makeAsyncFunc(Thunk);
async.stream = <any> makeAsyncFunc(Stream);
async.express = <any> makeAsyncFunc(Express);
async.iterable = Iterable;
async.maxConcurrency = Protocol.maxConcurrency;
