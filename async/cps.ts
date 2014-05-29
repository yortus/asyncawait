import references = require('references');
import _ = require('lodash'); //TODO: remove dep
import asyncBase = require('./impl/asyncBase2');
import CPSProtocol = require('./impl/protocols/cps');
export = async;


class CPS {
    constructor(private resume, private suspend) {}
    create(callback_: AsyncAwait.Callback<any>) {
        //TODO: allow callback to be omitted if arity is known (need option for this?)
        if (!_.isFunction(callback_)) throw new Error('Expected final argument to be a callback');
        this.callback = callback_;
        setImmediate(this.resume);
    }
    delete() {}
    return(result) { this.callback(null, result); }
    throw(error) { this.callback(error); }
    yield(value) {}
    private callback: Function = null;
}



//var async = asyncBase.mod({ constructor: CPSProtocol });
var async: AsyncAwait.AsyncCPS = <any> asyncBase.mod((resume, suspend) => {
    return new CPS(resume, suspend);
    //var callback: Function;
    //var result =  {
    //    create: (callback_: AsyncAwait.Callback<any>) => {
    //        //TODO: allow callback to be omitted if arity is known (need option for this?)
    //        if (!_.isFunction(callback_)) throw new Error('Expected final argument to be a callback');
    //        callback = callback_;
    //        setImmediate(resume);
    //    },
    //    delete: () => {},
    //    return: result => callback(null, result),
    //    throw: error => callback(error),
    //    yield: value => {}
    //};
    //return result;
});
