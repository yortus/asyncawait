var chai = require('chai');
var Promise = require('bluebird');
var async = require('asyncawait/async');

var expect = chai.expect;

//TODO: repurpose tests...
describe('A suspendable function returned by async(...)', function () {
    it('synchronously returns a promise', function () {
        var foo = async(function () {
        });
        var syncResult = foo();
        expect(syncResult).instanceOf(Promise);
    });

    it('begins executing synchronously and completes asynchronously', function (done) {
        var x = 5;
        var foo = async(function () {
            x = 7;
        });
        foo().then(function () {
            return expect(x).to.equal(9);
        }).then(function () {
            return done();
        }).catch(done);
        expect(x).to.equal(7);
        x = 9;
    });
});
//# sourceMappingURL=protocols.js.map
