import CallbackArg = require('./callbackArg');
import ReturnValue = require('./returnValue');
export = Options;


/**
 * TODO:...
 */
interface Options {
    returnValue?: ReturnValue;
    callbackArg?: CallbackArg;
    isIterable?: boolean;
    //TODO:...isVariadic?: boolean;
    maxConcurrency?: number;
}
