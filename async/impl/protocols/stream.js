//import references = require('references');
//import stream = require('stream');
//import Promise = require('bluebird');
//import Protocol = require('./base');
//export = StreamProtocol;
///** Protocol for a suspendable function which returns a stream. */
//class StreamProtocol extends Protocol {
//    constructor(options?: AsyncAwait.ProtocolOptions<AsyncAwait.AsyncStream>) { super(); }
//    invoke(): stream.Readable {
//        super.invoke();//TODO: this is a no-op. Remove?
//        var stream = this.stream = new Stream(() => setImmediate(() => this.resume()));
//        return stream;
//    }
//    return(result) {
//        this.stream.push(null);
//    }
//    throw(error) {
//        this.stream.emit('error', error);
//    }
//    yield(value) {
//        this.stream.push(value);
//        this.suspend();
//    }
//    private stream: Stream;
//}
//class Stream extends stream.Readable {
//    constructor(private readImpl: () => void) {
//        super({objectMode: true});
//    }
//    _read() {
//        this.readImpl();
//    }
//}
//# sourceMappingURL=stream.js.map
