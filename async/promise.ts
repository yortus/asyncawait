import references = require('references');
import asyncBase = require('./impl/asyncBase');
import PromiseProtocol = require('./impl/protocols/promise');
export = async;


var async = asyncBase.mod({ protocol: PromiseProtocol });
