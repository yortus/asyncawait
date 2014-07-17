var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var oldBuilder = require('../src/asyncBuilder');
var stream = require('stream');

var builder = oldBuilder.derive(function () {
    return ({
        invoke: function (co) {
            return (co.context = new Stream(function () {
                return co.enter();
            }));
        },
        return: function (stream, result) {
            return stream.push(null);
        },
        throw: function (stream, error) {
            return stream.emit('error', error);
        },
        yield: function (stream, value) {
            setImmediate(function () {
                return stream.push(value);
            });
        }
    });
});

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
module.exports = builder;
//# sourceMappingURL=stream.js.map
