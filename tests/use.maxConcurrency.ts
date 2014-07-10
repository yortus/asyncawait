import references = require('references');
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import use = require('asyncawait/src/use');
import pipeline = require('asyncawait/src/pipeline');
import maxConcurrency = require('asyncawait/mods/maxConcurrency');
var expect = chai.expect;


describe('Using the maxConcurrency mod', () => {

    var started = 0, finished = 0;
    var opA = async (() => { ++started; await (Promise.delay(20)); ++finished; });
    var opB = async (() => { return { started: started, finished: finished }; });


    it('applies the specified concurrency factor to subsequent operations', done => {

        function doTasks(maxCon: number) {
            started = finished = 0;
            pipeline.reset();
            use(maxConcurrency(maxCon));
            return Promise
                .all([opA(), opA(), opA(), opA(), opA(), opB()])
                .then(r => <any> r[5]);
        }

        doTasks(10)
        .then(r => expect(r.finished).to.equal(0))
        .then(() => doTasks(1))
        .then(r => expect(r.finished).to.equal(5))
        .then(() => doTasks(5))
        .then(r => expect(r.finished).to.be.greaterThan(0))
        .then(() => done())
        .catch(done);
    });
});
