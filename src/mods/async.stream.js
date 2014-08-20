var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var stream = require('stream');
var _ = require('../util');

var mod = {
    name: 'async.stream',
    base: '',
    override: function (base, options) {
        return ({
            begin: function (fi) {
                var stream = fi.context = new Stream(function () {
                    return fi.resume();
                });
                return stream;
            },
            suspend: function (fi, error, value) {
                // TODO: handle by emitting error event?
                if (error)
                    throw error;

                // Ensure the fiber has yielded before the stream emits the value.
                setImmediate(function () {
                    return fi.context.push(value);
                });
                _.yieldCurrentFiber();
            },
            end: function (fi, error, value) {
                // TODO: if error, should we still push null to emit 'end' event as well? Check stream docs... I think errors are not considered final
                if (error)
                    fi.context.emit('error', error);
                else
                    fi.context.push(null);
            }
        });
    }
};

var Stream = (function (_super) {
    __extends(Stream, _super);
    function Stream(readImpl) {
        _super.call(this, { objectMode: true });
        this.readImpl = readImpl;
    }
    Stream.prototype._read = function () {
        this.readImpl();
    };
    return Stream;
})(stream.Readable);
module.exports = mod;
//# sourceMappingURL=async.stream.js.map
