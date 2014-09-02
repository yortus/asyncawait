import references = require('references');
import stream = require('stream');
import _ = require('../util');
export = mod;

//TODO: add await stream support

var mod = {

    name: 'async.stream',

    base: '',

    override: (base, options) => ({

        begin: (fi) => {
            var stream = fi.context = new Stream(() => fi.resume());
            return <stream.Readable> stream;
        },

        suspend: (fi, error?, value?) => {

            // TODO: handle by emitting error event?
            if (error) throw error; // NB: not handled - throw in fiber

            // Ensure the fiber has yielded before the stream emits the value.
            setImmediate(() => fi.context.push(value));
            _.yieldCurrentFiber();
        },

        end: (fi, error?, value?) => {

            // TODO: if error, should we still push null to emit 'end' event as well? Check stream docs... I think errors are not considered final
            if (error) fi.context.emit('error', error); else fi.context.push(null);
        }
    })
};


class Stream extends stream.Readable {
    constructor(private readImpl: () => void) {
        super({objectMode: true});
    }

    _read() {
        this.readImpl();
    }
}
