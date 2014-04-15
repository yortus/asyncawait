import _refs = require('_refs');
import Config = require('./config');
import factory = require('./factory');
export = async;


/** TODO: where to put this vsdoc?
 * Creates a function that can be suspended at each asynchronous operation using await().
 * @param {Function} fn - Contains the body of the suspendable function. Calls to await()
 *                        may appear inside this function.
 * @returns {Function} A function of the form `(...args) --> Promise`. Any arguments
 *                     passed to this function are passed through to fn. The returned
 *                     promise is resolved when fn returns, or rejected if fn throws.
 */


var defaultConfig = new Config();
var async: AsyncAwait.Async;
async = <any> factory(defaultConfig);
async.iterable = <any> async.mod({ isIterable: true });
async.cps = <any> async.mod({ returnValue: Config.NONE, callbackArg: Config.REQUIRED });
