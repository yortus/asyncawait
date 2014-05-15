import references = require('references');
import makeAsyncFunc = require('./impl/makeAsyncFunc');
import Protocol = require('./impl/protocols/base');
import PromiseProtocol = require('./impl/protocols/promise');
import Promise = require('./promise');
import CPS = require('./cps');
import Thunk = require('./thunk');
import Stream = require('./stream');
import Express = require('./express');
import Iterable = require('./iterable/index');
export = async;


var async: AsyncAwait.Async = <any> makeAsyncFunc(PromiseProtocol);
async.promise = Promise;
async.cps = CPS;
async.thunk = Thunk;
async.stream = Stream;
async.express = Express;
async.iterable = Iterable;
async.maxConcurrency = Protocol.maxConcurrency; //TODO: move to config({...}) method
