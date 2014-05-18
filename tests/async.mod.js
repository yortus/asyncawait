var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var chai = require('chai');

var async = require('asyncawait/async');

var PromiseProtocol = require('../async/impl/protocols/promise');
var expect = chai.expect;

var XProtocol = (function (_super) {
    __extends(XProtocol, _super);
    function XProtocol(opts) {
        _super.call(this);
        this.opts = opts;
        this.prefix = opts.prefix || '';
        this.suffix = opts.suffix || '';
    }
    XProtocol.prototype.return = function (value) {
        _super.prototype.return.call(this, this.prefix + value + this.suffix);
    };
    XProtocol.prototype.throw = function (err) {
        _super.prototype.throw.call(this, new Error(this.prefix + err.message + this.suffix));
    };
    return XProtocol;
})(PromiseProtocol);

describe('async.mod(...)', function () {
    it('returns a new async function defaulting to the same protocol', function (done) {
        var a2 = async.mod({ constructor: null });
        expect(a2).to.exist;
        expect(a2).to.not.equal(async);
        var fn = a2(function (n) {
            return 111 * n;
        });
        fn(7).then(function (r) {
            return expect(r).to.equal(777);
        }).then(function () {
            return done();
        }).catch(done);
    });

    it('returns an async function that uses the specified protocol', function (done) {
        var asyncX = async.mod({ constructor: XProtocol });
        var fn = asyncX(function (msg) {
            return msg;
        });
        fn('BLAH!').then(function (r) {
            return expect(r).to.equal('BLAH!');
        }).then(function () {
            return done();
        }).catch(done);
    });

    it('returns an async function that uses the specified protocol options', function (done) {
        var asyncX = async.mod({ constructor: XProtocol, prefix: '<<<', suffix: '>>>' });
        var fn = asyncX(function (msg) {
            return msg;
        });
        fn('BLAH!').then(function (r) {
            return expect(r).to.equal('<<<BLAH!>>>');
        }).then(function () {
            return done();
        }).catch(done);
    });
});
//# sourceMappingURL=async.mod.js.map
