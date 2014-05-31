var asyncBase = require('./impl/asyncBase2');
var config = require('./impl/config');

var Promise = require('./promise');
var CPS = require('./cps');
var Thunk = require('./thunk');


var async = asyncBase.mod(function (base) {
    var resolver = require('bluebird').defer();
    var result = {
        create: function () {
            setImmediate(function () {
                return base.resume();
            });
            return resolver.promise;
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
module.exports = async;
//# sourceMappingURL=index.js.map
