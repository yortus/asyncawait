var asyncBase = require('./impl/asyncBase2');
var config = require('./impl/config');

var Promise = require('./promise');
var CPS = require('./cps');
var Thunk = require('./thunk');
var Stream = require('./stream');
var Express = require('./express');
var Iterable = require('./iterable/index');

var async = asyncBase.mod(function (resume, suspend) {
    var resolver = require('bluebird').defer();
    var result = {
        create: function () {
            setImmediate(resume);
            return resolver.promise;
        },
        delete: function () {
        },
        return: function (result) {
            return resolver.resolve(result);
        },
        throw: function (error) {
            return resolver.reject(error);
        },
        yield: function (value) {
            return resolver.progress(value);
        }
    };
    return result;
});
async.config = config;
async.promise = Promise;
async.cps = CPS;
async.thunk = Thunk;
async.stream = Stream;
async.express = Express;
async.iterable = Iterable;
module.exports = async;
//# sourceMappingURL=index.js.map
