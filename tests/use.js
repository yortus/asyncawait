var chai = require('chai');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var use = require('asyncawait/src/use');
var pipeline = require('asyncawait/src/pipeline');
var maxConcurrency = require('asyncawait/src/extensions/maxConcurrency');
var expect = chai.expect;

//var origConcurrency;
//beforeEach(() => origConcurrency = async.config().maxConcurrency);
//afterEach(() => async.config({ maxConcurrency: origConcurrency }));
//describe('Getting a config object from async.config()', () => {
//    it('returns a different object on each call', () => {
//        var cfgs = [async.config(), async.config(), async.config()];
//        expect(cfgs[0]).to.not.equal(cfgs[1]);
//        expect(cfgs[0]).to.not.equal(cfgs[2]);
//        expect(cfgs[1]).to.not.equal(cfgs[2]);
//    });
//    it('returns an object that is a detached copy of config', () => {
//        var cfg = async.config();
//        cfg.maxConcurrency += 6;
//        expect(async.config().maxConcurrency).to.equal(cfg.maxConcurrency - 6);
//    });
//    it('returns the maxConcurrency value most recently set', () => {
//        async.config({ maxConcurrency: 17 });
//        expect(async.config().maxConcurrency).to.equal(17);
//        async.config({ maxConcurrency: 1000000 });
//        expect(async.config().maxConcurrency).to.equal(1000000);
//    });
//});
describe('Setting config via async.config(...)', function () {
    var started = 0, finished = 0;
    var opA = async(function () {
        ++started;
        await(Promise.delay(20));
        ++finished;
    });
    var opB = async(function () {
        return { started: started, finished: finished };
    });

    //it('updates maxConcurency to the specified value', () => {
    //    async.config({ maxConcurrency: 17 });
    //    expect(async.config().maxConcurrency).to.equal(17);
    //    async.config({ maxConcurrency: 1000000 });
    //    expect(async.config().maxConcurrency).to.equal(1000000);
    //});
    //it('leaves omitted config values unchanged', () => {
    //    async.config({ maxConcurrency: 17 });
    //    expect(async.config().maxConcurrency).to.equal(17);
    //    async.config({ });
    //    async.config({ maxConcurrency: undefined });
    //    async.config({ maxConcurrency: null });
    //    expect(async.config().maxConcurrency).to.equal(17);
    //});
    it('applies the specified maxConcurrency setting to subsequent operations', function (done) {
        function doTasks(maxCon) {
            try  {
                started = finished = 0;
                pipeline.reset();
                use(maxConcurrency(maxCon));
                return Promise.all([opA(), opA(), opA(), opA(), opA(), opB()]).then(function (r) {
                    return r[5];
                });
            } catch (err) {
                console.log(err);
                throw err;
            }
        }

        doTasks(10).then(function (r) {
            return expect(r.finished).to.equal(0);
        }).then(function () {
            return doTasks(1);
        }).then(function (r) {
            return expect(r.finished).to.equal(5);
        }).then(function () {
            return doTasks(5);
        }).then(function (r) {
            return expect(r.finished).to.be.greaterThan(0);
        }).then(function () {
            return done();
        }).catch(done);
    });
});
//# sourceMappingURL=use.js.map
