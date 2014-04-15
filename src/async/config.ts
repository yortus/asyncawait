import CallbackArg = require('./callbackArg');
import ReturnValue = require('./returnValue');
export = Config;


/**
 * TODO:...
 */
class Config {
    constructor() { }
    returnValue: ReturnValue;
    callbackArg: CallbackArg;
    isIterable: boolean;
    //TODO:...isVariadic?: boolean;
    maxConcurrency: number;
}
