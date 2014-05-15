var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var stream = require('stream');

var Coro = require('../coro');

var StreamCoro = (function (_super) {
    __extends(StreamCoro, _super);
    function StreamCoro() {
        _super.call(this);
    }
    StreamCoro.prototype.invoke = function (func, this_, args) {
        var _this = this;
        _super.prototype.invoke.call(this, func, this_, args);
        var stream = this.stream = new Stream(function () {
            return setImmediate(function () {
                return _this.resume();
            });
        });
        return stream;
    };

    StreamCoro.prototype.return = function (result) {
        this.stream.push(null);
    };

    StreamCoro.prototype.throw = function (error) {
        this.stream.emit('error', error);
    };

    StreamCoro.prototype.yield = function (value) {
        this.stream.push(value);
        this.suspend();
    };
    return StreamCoro;
})(Coro);

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
module.exports = StreamCoro;
//# sourceMappingURL=stream.js.map
