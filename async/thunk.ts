import references = require('references');
import asyncBase = require('./impl/asyncBase');
import ThunkProtocol = require('./impl/protocols/thunk');
export = async;


var async = asyncBase.mod({ protocol: ThunkProtocol });
