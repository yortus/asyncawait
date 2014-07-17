import references = require('references');
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import use = require('asyncawait/src/use');
import pipeline = require('asyncawait/src/pipeline');
import maxConcurrency = require('asyncawait/mods/maxConcurrency');
var expect = chai.expect;

// TODO: More tests...
// - race condition (causing timeout) - how?
// works with async.iterable example (covers yield behaviour) (failed before due to yield bug)


describe('The maxConcurrency mod', () => {

    var started = 0, finished = 0;
    var opA = async (() => { ++started; await (Promise.delay(20)); ++finished; });
    var opB = async (() => ({ started: started, finished: finished }));
    var reset = () => { pipeline.reset(); (<any> maxConcurrency)._reset(); };

    it('applies the specified concurrency factor to subsequent operations', done => {

        function doTasks(maxCon: number) {
            started = finished = 0;
            reset();
            use(maxConcurrency(maxCon));
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
            use(maxConcurrency(10));
            i = 2;
            use(maxConcurrency(5));
            i = 3;
        }
        catch (err) { }
        finally {
            expect(i).to.equal(2);
            done();
        }
    });
});
