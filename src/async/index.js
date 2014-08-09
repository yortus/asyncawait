var assert = require('assert');
var asyncBuilder = require('../asyncBuilder');
var iterable = require('./iterable/index');
var internalState = require('../config/internalState');

var api = function (invokee) {
    assert(arguments.length === 1, 'async: expected a single argument');
    var async = internalState.options.defaults.async || asyncBuilder;
    return async(invokee);
};
api.mod = function mod(mod) {
    assert(arguments.length === 1, 'async.mod: expected a single argument');
    var async = internalState.options.defaults.async || asyncBuilder;
    return async.mod(mod);
};

//TODO: temp
api.iterable = iterable;
module.exports = api;
//# sourceMappingURL=index.js.map
