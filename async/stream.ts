import references = require('references');
import oldBuilder = require('../src/asyncBuilder');
import stream = require('stream');
export = builder;


var builder = oldBuilder.derive<AsyncAwait.Async.StreamBuilder>(() => ({
    invoke: (co) => (co.context = new Stream(() => co.enter())),
    return: (stream, result) => stream.push(null),
    throw: (stream, error) => stream.emit('error', error),
    yield: (stream, value) => { stream.push(value); }
}));


class Stream extends stream.Readable {
    constructor(private readImpl: () => void) {
        super({objectMode: true});
    }

    _read() {
        this.readImpl();
    }
}
