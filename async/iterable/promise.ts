import references = require('references');
import asyncBase = require('../impl/asyncBase');
import IterablePromiseProtocol = require('../impl/protocols/iterablePromise');
export = async;


var async = asyncBase.mod({ protocol: IterablePromiseProtocol });
