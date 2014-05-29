import references = require('references');
import Promise = require('bluebird');
import asyncBase = require('./impl/asyncBase2');
import PromiseProtocol = require('./impl/protocols/promise');
export = async;


//class P {
//    constructor(private resume, private suspend) {}
//    create() { setImmediate(this.resume); return this.resolver.promise; }
//    delete() {}
//    return(result) { this.resolver.resolve(result); }
//    throw(error) { this.resolver.reject(error); }
//    yield(value) { this.resolver.progress(value); }
//    private resolver = Promise.defer<any>();
//}


var async: AsyncAwait.AsyncPromise = <any> asyncBase.mod((resume, suspend) => {
    //return new P(resume, suspend);
    var resolver = Promise.defer<any>();
    var result =  {
        create: () => { setImmediate(resume); return resolver.promise; },
        delete: () => {},
        return: result => resolver.resolve(result),
        throw: error => resolver.reject(error),
        yield: value => resolver.progress(value)
    };
    return result;
});
