var Promise = require('bluebird');


function deriveCPS_OLD(base) {
    function CPS() {
        this.resolver = Promise.defer();
        this.create = function() {
            base.resume();
            return this.resolver.promise;
        }
        this.return = function (result) { this.resolver.resolve(result); }
        this.throw = function (error) { this.resolver.reject(error); }
    }
    CPS.prototype = base;
    return CPS;
}
var deriveCPS = function (base) {
    return {
        create: function() {
            this.resolver = Promise.defer();
            base.resume();
            return resolver.promise;
        },
        return: function (result) { this.resolver.resolve(result); },
        throw: function (error) { this.resolver.reject(error); }
    }
}


var base = {
    _self: null,
    create: function () {},
    delete: function () {},
    resume: function () { this._self.return(555); },      // May call DERIVED.return,throw,delete
    suspend: function () {},
    return: function () {},
    throw: function () {},
    yield: function () {},
};
var derived = {
    create: function () {},                         // May call BASE.create,resume
    delete: function () {},                         // May call BASE.delete
    resume: function () {},
    suspend: function () {},
    return: function () {},                         // May call BASE.return
    throw: function () {},                          // May call BASE.throw
    yield: function () {},                          // May call BASE.yield
};


debugger;
var derived = deriveCPS(base); // Once only, NOT every time
derived.prototype = base;
base._self = derived;
derived.create();





//var CPS = deriveCPS(base);
//var cps = new CPS();
//base._self = cps;
//cps.create();
