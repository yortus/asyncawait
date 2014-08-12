//TODO: remove unneeded...
import references = require('references');
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import config = require('asyncawait/config');
import yield_ = require('asyncawait/yield');
import _ = require('asyncawait/src/util');
import Protocol = require('asyncawait/src/protocols/protocol');
var expect = chai.expect;


//TODO: repurpose tests...
describe('A suspendable function returned by async(...)', () => {

    it('synchronously returns a promise', () => {
        var foo = async (() => {});
        var syncResult = foo();
        expect(syncResult).instanceOf(Promise);
    });

    it('begins executing synchronously and completes asynchronously', done => {
        var x = 5;
        var foo = async (() => { x = 7; });
        foo()
        .then(() => expect(x).to.equal(9))
        .then(() => done())
        .catch(done);
        expect(x).to.equal(7);
        x = 9;
    });
});
