import references = require('references');
import oldBuilder = require('../src/asyncBuilder');
import stream = require('stream');
export = newBuilder;


var newBuilder = oldBuilder.mod({

    name: 'stream',

    type: <AsyncAwait.Async.StreamBuilder> null,

    overrideProtocol: (base, options) => ({
        invoke: (co) => (co.context = new Stream(() => co.enter())),
        return: (stream, result) => stream.push(null),
        throw: (stream, error) => stream.emit('error', error),
        yield: (stream, value) => { setImmediate(() => stream.push(value)); }
    })
});


class Stream extends stream.Readable {
    constructor(private readImpl: () => void) {
        super({objectMode: true});
    }

    _read() {
        this.readImpl();
    }
}
