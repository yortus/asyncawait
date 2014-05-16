import references = require('references');
import asyncBase = require('./impl/asyncBase');
import CPSProtocol = require('./impl/protocols/cps');
export = async;


var async = asyncBase.mod({ protocol: CPSProtocol });
