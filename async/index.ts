import references = require('references');
import asyncBase = require('./impl/asyncBase2');
import config = require('./impl/config');
import PromiseProtocol = require('./impl/protocols/promise');
import Promise = require('./promise');
import CPS = require('./cps');
import Thunk = require('./thunk');
import Stream = require('./stream');
import Express = require('./express');
import Iterable = require('./iterable/index');
export = async;


var async: AsyncAwait.Async = <any> asyncBase.mod((resume, suspend) => {
    var resolver = require('bluebird').defer();
    var result =  {
        create: () => { setImmediate(resume); return resolver.promise; },
        delete: () => {},
        return: result => resolver.resolve(result),
        throw: error => resolver.reject(error),
        yield: value => resolver.progress(value)
    };
    return result;
});
async.config = config;
async.promise = Promise;
async.cps = CPS;
async.thunk = Thunk;
async.stream = Stream;
async.express = Express;
async.iterable = Iterable;
