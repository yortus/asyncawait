var chai = require('chai');

var async = require('asyncawait/async');

var expect = chai.expect;

var customProtocolFactory = function (options, baseProtocol) {
    var prefix = options.prefix || '';
    var suffix = options.suffix || '';
    return {
        return: function (co, result) {
            return baseProtocol.return(co, prefix + result + suffix);
        },
        throw: function (co, error) {
            return baseProtocol.throw(co, new Error(prefix + error.message + suffix));
        }
    };
};

describe('async.derive(...)', function () {
    it('returns a new async function defaulting to the same protocol', function (done) {
        var a2 = async.derive({});
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
        var asyncX = async.derive(customProtocolFactory);
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
        var asyncX = async.derive(customProtocolFactory).derive({ prefix: '<<<', suffix: '>>>' });
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
//# sourceMappingURL=async.derive.js.map
