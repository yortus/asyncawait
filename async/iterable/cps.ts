import references = require('references');
import makeAsyncFunc = require('../impl/makeAsyncFunc');
import IterableCPSProtocol = require('../impl/protocols/iterableCps');
export = async;


var async: AsyncAwait.AsyncIterableCPS = <any> makeAsyncFunc(IterableCPSProtocol);
