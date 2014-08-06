var chai = require('chai');

var async = require('asyncawait/async');

var expect = chai.expect;

var testMod = {
    overrideProtocol: function (base, options) {
        var prefix = options.prefix || '';
        var suffix = options.suffix || '';
        return {
            end: function (fi, error, value) {
                if (error)
                    return base.end(fi, new Error(prefix + error.message + suffix));
                return base.end(fi, null, prefix + value + suffix);
            }
        };
    }
};

//TODO: add a few more tests here covering the various expectations of mods
describe('async.mod(...)', function () {
    it('returns a new async function defaulting to the same protocol', function (done) {
        var a2 = async.mod({});
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
        var asyncX = async.mod(testMod);
        var fn = asyncX(function (msg) {
            return msg;
        });
        fn('BLAH!').then(function (r) {
            return expect(r).to.equal('BLAH!');
        }).then(function () {
            return done();
        }).catch(done);
    });

    //TODO: review this test... awkward way to just pass some options!
    it('returns an async function that uses the specified protocol options', function (done) {
        var asyncX = async.mod(testMod).mod({ defaultOptions: { prefix: '<<<', suffix: '>>>' } });
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
