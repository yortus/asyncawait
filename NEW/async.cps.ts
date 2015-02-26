import api = require('./api');
import Coroutine = require('./coroutine');
export = protocol;


// extension
interface CoroutineEx extends Coroutine {
    callback: Function;
}


var protocol: api.AsyncProtocol = {

    type: 'async',

    name: 'cps',

    dependencies: ['base'],

    definition: (base) => ({

        define: (bodyFunc: Function) => {
            var result = base.define(bodyFunc);
            result.params.push('callback'); // TODO: check for duplicate name in array?
            return result;
        },

        invoke: (coro: CoroutineEx) => {
            coro.callback = coro.args.pop();
            coro.resume();
            return void 0;
        },

        return: (coro: CoroutineEx, value?: any) => {
            coro.callback(null, value);
        },

        throw: (coro: CoroutineEx, error: Error) => {
            coro.callback(error);
        }
    })
};
