var Promise = require('bluebird');
var asyncBase = require('./impl/asyncBase2');


//class P {
//    constructor(private resume, private suspend) {}
//    create() { setImmediate(this.resume); return this.resolver.promise; }
//    delete() {}
//    return(result) { this.resolver.resolve(result); }
//    throw(error) { this.resolver.reject(error); }
//    yield(value) { this.resolver.progress(value); }
//    private resolver = Promise.defer<any>();
//}
var async = asyncBase.mod(function (base) {
    //return new P(resume, suspend);
    var resolver = Promise.defer();
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
module.exports = async;
//# sourceMappingURL=promise.js.map
