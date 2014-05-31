var chai = require('chai');
var Promise = require('bluebird');
var async = require('asyncawait/async');

var expect = chai.expect;

var overrideMethod1 = function (base, options) {
    options = options || {};
    var prefix = options.prefix || '';
    var suffix = options.suffix || '';
    var resolver = Promise.defer();
    var result = {
        create: function () {
            setImmediate(function () {
                return base.resume();
            });
            return resolver.promise;
        },
        delete: function () {
        },
        return: function (result) {
            return resolver.resolve(prefix + result + suffix);
        },
        throw: function (error) {
            return resolver.reject(prefix + error.message + suffix);
        },
        yield: function (value) {
            return resolver.progress(value);
        }
    };
    return result;
};

describe('async.mod(...)', function () {
    it('returns a new async function defaulting to the same protocol', function (done) {
        var a2 = async.mod();
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
        var asyncX = async.cps.mod(overrideMethod1);

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
        var asyncX = async.mod(overrideMethod1).mod({ prefix: '<<<', suffix: '>>>' });

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
