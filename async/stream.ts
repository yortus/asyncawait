import references = require('references');
import stream = require('stream');
import oldBuilder = require('../src/asyncBuilder');
import pipeline = require('../src/pipeline');
export = newBuilder;


/** Fiber interface extended with type information for 'context'. */
interface FiberEx extends Fiber {
    context: Stream;
}


var newBuilder = oldBuilder.mod({

    name: 'stream',

    type: <AsyncAwait.Async.StreamBuilder> null,

    overrideProtocol: (base, options) => ({

        begin: (fi: FiberEx) => {
            var stream = fi.context = new Stream(() => fi.resume());
            return stream;
        },

        suspend: (fi: FiberEx, error?, value?) => {

            // TODO: handle by emitting error event?
            if (error) throw error; // NB: not handled - throw in fiber

            //TODO: should setImmediate go here, or in pipeline?
            setImmediate(() => fi.context.push(value));

            // TODO: correct?
            pipeline.suspendCoro();
        },

        end: (fi: FiberEx, error?, value?) => {

            // TODO: if error, should we still push null to emit 'end' event as well? Check stream docs... I think errors are not considered final
            if (error) fi.context.emit('error', error); else fi.context.push(null);
        }
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
