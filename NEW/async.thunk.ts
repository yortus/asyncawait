import api = require('./api');
import Coroutine = require('./coroutine');
export = protocol;


var protocol: api.AsyncProtocol = {

    type: 'async',

    name: 'thunk',

    dependencies: ['cps'],

    definition: (cps) => ({

        invoke: (coro: Coroutine) => {
            return (callback: Function) => {
                coro.args.push(callback);
                return cps.invoke(coro);
            };
        },

        return: cps.return,

        throw: cps.throw
    })
};
