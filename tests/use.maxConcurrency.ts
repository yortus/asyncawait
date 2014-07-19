import references = require('references');
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import yield_ = require('asyncawait/yield');
import pipeline = require('asyncawait/src/pipeline');
var maxSlots = require('asyncawait/src/mods/maxSlots');
var expect = chai.expect;


describe('The maxSlots mod', () => {

    var started = 0, finished = 0;
    var opA = async (() => { ++started; await (Promise.delay(20)); ++finished; });
    var opB = async (() => ({ started: started, finished: finished }));
    var reset = () => { pipeline.reset(); (<any> maxSlots)._reset(); };

    it('applies the specified concurrency factor to subsequent operations', done => {

        function doTasks(maxCon: number) {
            started = finished = 0;
            reset();
            async.use(maxSlots(maxCon));
            return Promise
                .all([opA(), opA(), opA(), opA(), opA(), opB()])
                .then(r => <any> r[5]);
        }

        doTasks(10)
        .then(r => expect(r.finished).to.equal(0))
        .then(() => Promise.delay(40))
        .then(() => doTasks(1))
        .then(r => expect(r.finished).to.equal(5))
        .then(() => Promise.delay(40))
        .then(() => doTasks(5))
        .then(r => expect(r.finished).to.be.greaterThan(0))
        .then(() => Promise.delay(40))
        .then(() => done())
        .catch(done);
    });

    it('fails if applied more than once', done => {
        reset();
        try {
            var i = 1;
            async.use(maxSlots(10));
            i = 2;
            async.use(maxSlots(5));
            i = 3;
        }
        catch (err) { }
        finally {
            expect(i).to.equal(2);
            done();
        }
    });

    it('lets nested invocations pass through to prevent deadlocks', done => {
        var start1Timer = async (() => await (Promise.delay(20)));
        var start10Timers = async (() => await ([1,2,3,4,5,6,7,8,9,10].map(start1Timer)));
        var start100Timers = () => Promise.all([1,2,3,4,5,6,7,8,9,10].map(start10Timers));

        // The following would cause a deadlock if sub-level coros are not passed through
        reset();
        async.use(maxSlots(2));
        start100Timers().then(() => done());
    });

    it('works with async.iterable and yield', done => {

        var foo = async.iterable ((count: number, accum?: any[]) => {
            if (count < 1 || count > 9) throw new Error('out of range');
            for (var i = 1; i <= count; ++i) {
                if (accum) accum.push(111 * i);
                yield_ (111 * i);
            }
            return 'done';
        });


        // Single file
        reset();
        async.use(maxSlots(1));
        var arr = [], promises = [1,2,3].map(n => foo(n, arr).forEach(() => {}));
        Promise.all(promises)
        .then(() => expect(arr).to.deep.equal([111, 111, 222, 111, 222, 333]))
        .then(() => done())
        .catch(done);

        // Concurrent
        reset();
        async.use(maxSlots(3));
        var arr = [], promises = [1,2,3].map(n => foo(n, arr).forEach(() => {}));
        Promise.all(promises)
        .then(() => expect(arr).to.deep.equal([111, 111, 111, 222, 222, 333]))
        .then(() => done())
        .catch(done);
        
    });
});
