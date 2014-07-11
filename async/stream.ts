import references = require('references');
import oldBuilder = require('../src/asyncBuilder');
import stream = require('stream');
export = builder;


var builder = oldBuilder.derive<AsyncAwait.Async.StreamBuilder>(() => ({
    default: (co) => { co.stream = null; },
    invoke: (co) => co.stream = new Stream(() => co.enter()),
    return: (co, result) => co.stream.push(null),
    throw: (co, error) => co.stream.emit('error', error),
    yield: (co, value) => { co.stream.push(value); co.leave(); }
}));


class Stream extends stream.Readable {
    constructor(private readImpl: () => void) {
        super({objectMode: true});
    }

    _read() {
        this.readImpl();
    }
}
