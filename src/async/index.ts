import _refs = require('_refs');
import Config = require('./config');
import makeAsyncFunc = require('./makeAsyncFunc');
export = async;


var defaultConfig = new Config();
var async: AsyncAwait.Async = <any> makeAsyncFunc(defaultConfig);
async.iterable = <any> async.mod({ isIterable: true });
async.cps = <any> async.mod({ returnValue: Config.NONE, acceptsCallback: true });
