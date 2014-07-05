var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var oldBuilder = require('../src/asyncBuilder');
var stream = require('stream');


var builder = oldBuilder.mod(function () {
    return ({
        invoke: function (co) {
            return co.stream = new Stream(function () {
                return co.resume();
            });
        },
        return: function (co, result) {
            return co.stream.push(null);
        },
        throw: function (co, error) {
            return co.stream.emit('error', error);
        },
        yield: function (co, value) {
            co.stream.push(value);
            co.yield();
        },
        finally: function (co) {
            co.stream = null;
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
