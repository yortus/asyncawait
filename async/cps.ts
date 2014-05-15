import references = require('references');
import makeAsyncFunc = require('./impl/makeAsyncFunc');
import CPSProtocol = require('./impl/protocols/cps');
export = async;


var async: AsyncAwait.AsyncCPS = <any> makeAsyncFunc(CPSProtocol);
