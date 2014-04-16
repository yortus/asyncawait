import _refs = require('_refs');
export = Config;




/**
 * TODO:...
 */
class Config implements AsyncAwait.AsyncOptions {
    constructor() { }
    returnValue: string = Config.PROMISE; // Recognised values: 'none', 'promise', 'thunk', 'result'
    callbackArg: string = Config.NONE; // Recognised values: 'none', 'optional', 'required'
    isIterable: boolean = false;
    //TODO:...isVariadic?: boolean;
    maxConcurrency: number = null;

    /**
     * TODO:...
     */
    static NONE = 'none';
    static PROMISE = 'promise';
    static REQUIRED = 'required';

//TODO: add validate() function
    //eg must have at least one notification method
}
