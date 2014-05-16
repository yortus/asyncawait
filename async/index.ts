import references = require('references');
import asyncBase = require('./impl/asyncBase');
import config = require('./impl/config');
import PromiseProtocol = require('./impl/protocols/promise');
import Promise = require('./promise');
import CPS = require('./cps');
import Thunk = require('./thunk');
import Stream = require('./stream');
import Express = require('./express');
import Iterable = require('./iterable/index');
export = async;


var async: AsyncAwait.Async = <any> asyncBase.mod({ protocol: PromiseProtocol });
async.config = config;
async.promise = Promise;
async.cps = CPS;
async.thunk = Thunk;
async.stream = Stream;
async.express = Express;
async.iterable = Iterable;
