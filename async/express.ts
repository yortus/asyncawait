import references = require('references');
import makeAsyncFunc = require('./impl/makeAsyncFunc');
import ExpressProtocol = require('./impl/protocols/express');
export = async;


var async: AsyncAwait.AsyncCPS = <any> makeAsyncFunc(ExpressProtocol);
