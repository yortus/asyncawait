var Promise = require('bluebird');


//interface Prot {
//    create;
//    resume;
//    suspend;
//    return;
//    throw;
//    yield;
//}


function deriveCPS(base/*: Prot*/) {

    function CPS() {

        this.resolver = Promise.defer();

        this.create = function() {
            base.resume.call(this);
            //setImmediate(function () { base.resume(); });
            return this.resolver.promise;
        }

        this.return = function (result) { this.resolver.resolve(result); }
        this.throw = function (error) { this.resolver.reject(error); }
    }
    CPS.prototype = base;
    return CPS;
}

var base = {
    create: function () {},
    resume: function () { self.return(555); },
    suspend: function () {},
    return: function () {},
    throw: function () {},
    yield: function () {},
};


debugger;
var CPS = deriveCPS(base);
var cps = new CPS();
cps.create();
