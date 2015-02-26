import api = require('./api');
import Coroutine = require('./coroutine');
export = protocol;


// extension
interface CoroutineEx extends Coroutine {
    resolver: Promise.Resolver<any>;
}


var protocol: api.AsyncProtocol = {

    type: 'async',

    name: 'promise',

    dependencies: [],

    definition: () => ({

        invoke: (coro: CoroutineEx) => {
            var resolver = coro.resolver = Promise.defer<any>();
            coro.resume();
            return resolver.promise;
        },

        return: (coro: CoroutineEx, value?: any) => {
            coro.resolver.resolve(value);
        },

        throw: (coro: CoroutineEx, error: Error) => {
            coro.resolver.reject(error);
        }
    })
};
