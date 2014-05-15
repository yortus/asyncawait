import references = require('references');
import makeAsyncFunc = require('./impl/makeAsyncFunc');
import StreamProtocol = require('./impl/protocols/stream');
export = async;


var async: AsyncAwait.AsyncStream = <any> makeAsyncFunc(StreamProtocol);
