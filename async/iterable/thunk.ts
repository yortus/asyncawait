import references = require('references');
import asyncBase = require('../impl/asyncBase');
import IterableThunkProtocol = require('../impl/protocols/iterableThunk');
export = async;


var async = asyncBase.mod({ constructor: IterableThunkProtocol });
