var chai = require('chai');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var yield_ = require('asyncawait/yield');
var extensibility = require('asyncawait/src/extensibility');
var expect = chai.expect;

describe('The maxSlots mod', function () {
    var started = 0, finished = 0;
    var opA = async(function () {
        ++started;
        await(Promise.delay(20));
        ++finished;
    });
    var opB = async(function () {
        return ({ started: started, finished: finished });
    });
    var setMaxSlots = function (n) {
        extensibility.resetMods();
        extensibility.config({ maxSlots: n });
        extensibility.applyMods();
    };

    it('applies the specified concurrency factor to subsequent operations', function (done) {
        function doTasks(maxCon) {
            started = finished = 0;
            setMaxSlots(maxCon);
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

    it('lets nested invocations pass through to prevent deadlocks', function (done) {
        var start1Timer = async(function () {
            return await(Promise.delay(20));
        });
        var start10Timers = async(function () {
            return await([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(start1Timer));
        });
        var start100Timers = function () {
            return Promise.all([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(start10Timers));
        };

        // The following would cause a deadlock if sub-level coros are not passed through
        setMaxSlots(2);
        start100Timers().then(function () {
            return done();
        });
    });

    it('works with async.iterable and yield', function (done) {
        var foo = async.iterable(function (count, accum) {
            if (count < 1 || count > 9)
                throw new Error('out of range');
            for (var i = 1; i <= count; ++i) {
                if (accum)
                    accum.push(111 * i);
                yield_(111 * i);
            }
            return 'done';
        });

        // Single file
        setMaxSlots(1);
        var arr = [], promises = [1, 2, 3].map(function (n) {
            return foo(n, arr).forEach(function () {
            });
        });
        Promise.all(promises).then(function () {
            return expect(arr).to.deep.equal([111, 111, 222, 111, 222, 333]);
        }).then(function () {
            return done();
        }).catch(done);

        // Concurrent
        setMaxSlots(3);
        var arr = [], promises = [1, 2, 3].map(function (n) {
            return foo(n, arr).forEach(function () {
            });
        });
        Promise.all(promises).then(function () {
            return expect(arr).to.deep.equal([111, 111, 111, 222, 222, 333]);
        }).then(function () {
            return done();
        }).catch(done);
    });
});
//# sourceMappingURL=config.maxSlots.js.map
