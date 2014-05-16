import references = require('references');
import asyncBase = require('./impl/asyncBase');
import ExpressProtocol = require('./impl/protocols/express');
export = async;


var async = asyncBase.mod({ constructor: ExpressProtocol });
