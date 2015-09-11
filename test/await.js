var chai = require('chai');
var Promise = require('bluebird');
var async = require('../src/async/index');
var await = require('../src/await/index');
var expect = chai.expect;
//TODO more tests here and other await API parts (eg for thunk cf async.thunk.ts)
//TODO: all await.x tests: test handling of single/multiple args as appropriate
describe('The await(...) function', function () {
    it('throws if not called within a suspendable function', function () {
        expect(function () { return await(111); }).to.throw(Error);
    });
    it('suspends the suspendable function until the expression produces a result', function (done) {
        var x = 5;
        var foo = async(function () {
            await(Promise.delay(40));
            x = 7;
            await(Promise.delay(40));
            x = 9;
        });
        foo();
        Promise.delay(20)
            .then(function () { return expect(x).to.equal(5); })
            .then(function () { return Promise.delay(40); })
            .then(function () { return expect(x).to.equal(7); })
            .then(function () { return Promise.delay(40); })
            .then(function () { return expect(x).to.equal(9); })
            .then(function () { return done(); })
            .catch(done);
        expect(x).to.equal(5);
    });
    it('resumes the suspendable function with the value of the awaited expression', function (done) {
        var foo = async(function () { return await(Promise.delay(20).then(function () { return 'blah'; })); });
        foo()
            .then(function (result) { return expect(result).to.equal('blah'); })
            .then(function () { return done(); })
            .catch(done);
    });
});
//TODO: test with: promise, thunk, array, graph, value
//# sourceMappingURL=await.js.map