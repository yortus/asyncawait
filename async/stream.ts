import references = require('references');
import oldBuilder = require('../src/asyncBuilder');
import stream = require('stream');
export = builder;


var builder = oldBuilder.derive<AsyncAwait.Async.StreamBuilder>(() => ({
    clear: (co) => { co.stream = null; },
    invoke: (co) => co.stream = new Stream(() => co.enter()),
    return: (ctx, result) => ctx.stream.push(null),
    throw: (ctx, error) => ctx.stream.emit('error', error),
    yield: (ctx, value) => { ctx.stream.push(value); }
}));


class Stream extends stream.Readable {
    constructor(private readImpl: () => void) {
        super({objectMode: true});
    }

    _read() {
        this.readImpl();
    }
}
