var chai = require('chai');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var use = require('asyncawait/src/use');
var pipeline = require('asyncawait/src/pipeline');
var maxConcurrency = require('asyncawait/mods/maxConcurrency');
var expect = chai.expect;

describe('The maxConcurrency mod', function () {
    var started = 0, finished = 0;
    var opA = async(function () {
        ++started;
        await(Promise.delay(20));
        ++finished;
    });
    var opB = async(function () {
        return ({ started: started, finished: finished });
    });
    var reset = function () {
        pipeline.reset();
        maxConcurrency._reset();
    };

    it('applies the specified concurrency factor to subsequent operations', function (done) {
        function doTasks(maxCon) {
            started = finished = 0;
            reset();
            use(maxConcurrency(maxCon));
            return Promise.all([opA(), opA(), opA(), opA(), opA(), opB()]).then(function (r) {
                return r[5];
            });
        }

        doTasks(10).then(function (r) {
            return expect(r.finished).to.equal(0);
        }).then(function () {
            return Promise.delay(40);
        }).then(function () {
            return doTasks(1);
        }).then(function (r) {
            return expect(r.finished).to.equal(5);
        }).then(function () {
            return Promise.delay(40);
        }).then(function () {
            return doTasks(5);
        }).then(function (r) {
            return expect(r.finished).to.be.greaterThan(0);
        }).then(function () {
            return Promise.delay(40);
        }).then(function () {
            return done();
        }).catch(done);
    });

    it('fails if applied more than once', function (done) {
        reset();
        try  {
            var i = 1;
            use(maxConcurrency(10));
            i = 2;
            use(maxConcurrency(5));
            i = 3;
        } catch (err) {
        } finally {
            expect(i).to.equal(2);
            done();
        }
    });
});
//# sourceMappingURL=use.maxConcurrency.js.map
