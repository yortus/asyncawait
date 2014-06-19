import references = require('references');
import Promise = require('bluebird');
import transfer = require('../transfer');
export = promiseProtocol;


var promiseProtocol = {
    invoke: (co) => {
        co.resolver = Promise.defer<any>();
        transfer(co);
        return co.resolver.promise;
    },
    return: (co, result) => co.resolver.resolve(result),
    throw: (co, error) => co.resolver.reject(error),
    yield: (co, value) => co.resolver.progress(value),
    finally: (co) => { co.resolver = null; }
}
