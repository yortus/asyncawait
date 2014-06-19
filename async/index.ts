import references = require('references');
import createAsyncBuilder = require('../src/createAsyncBuilder');
import transfer = require('../src/transfer');
import promiseProtocol = require('../src/protocols/promise');
import promise = require('./promise');
import cps = require('./cps');
//import asyncBase = require('./impl/asyncBase2');
//import config = require('./impl/config');
////import PromiseProtocol = require('./impl/protocols/promise');
//import CPS = require('./cps');
//import Thunk = require('./thunk');
////import Stream = require('./stream');
////import Express = require('./express');
////import Iterable = require('./iterable/index');
export = async;


var async: AsyncAwait.Async.API = <any> createAsyncBuilder(promiseProtocol);
async.promise = promise;
async.cps = cps;









//var async: AsyncAwait.Async = <any> asyncBase.mod(base => {
//    var resolver = require('bluebird').defer();
//    var result =  {
//        create: () => { setImmediate(() => base.resume()); return resolver.promise; },
//        return: result => resolver.resolve(result),
//        throw: error => resolver.reject(error),
//        yield: value => resolver.progress(value)
//    };
//    return result;
//});
//async.config = config;
//async.promise = Promise;
//async.cps = CPS;
//async.thunk = Thunk;
////async.stream = Stream;
////async.express = Express;
////async.iterable = Iterable;
