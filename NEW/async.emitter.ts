import api = require('./api');
import Coroutine = require('./coroutine');
export = protocol;


// extension
interface CoroutineEx extends Coroutine {
    stream: NodeJS.WritableStream;
}


var protocol: api.AsyncProtocol = {

    type: 'async',

    name: 'emitter',

    dependencies: [],

    definition: () => ({

        invoke: (coro: CoroutineEx) => {
            var stream = coro.stream = new stream; //TODO: construct in object mode
            coro.resume();
            return stream;
        },

        return: (coro: CoroutineEx, value?: any) => {
            coro.stream.emit('end', value);
        },

        throw: (coro: CoroutineEx, error: Error) => {
            coro.stream.emit('error', error);
            //TODO: and then emit 'end' event, or resume coro?
        },

        yield: (coro: CoroutineEx, value: any) => {
            coro.stream.emit('data', value);
            //TODO: do we pause here until some stream event?
        }
    })
};
