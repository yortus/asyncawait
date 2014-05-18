var chai = require('chai');
var Promise = require('bluebird');
var _ = require('lodash');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var expect = chai.expect;

var origConcurrency;
beforeEach(function () {
    return origConcurrency = async.config().maxConcurrency;
});
afterEach(function () {
    return async.config({ maxConcurrency: origConcurrency });
});

describe('Getting a config object from async.config()', function () {
    it('returns a different object on each call', function () {
        var cfgs = [async.config(), async.config(), async.config(), async.config()];
        expect(_.unique(cfgs).length).to.equal(cfgs.length);
    });

    it('returns an object that is a detached copy of config', function () {
        var cfg = async.config();
        cfg.maxConcurrency += 6;
        expect(async.config().maxConcurrency).to.equal(cfg.maxConcurrency - 6);
    });

    it('returns the maxConcurrency value most recently set', function () {
        async.config({ maxConcurrency: 17 });
        expect(async.config().maxConcurrency).to.equal(17);
        async.config({ maxConcurrency: 1000000 });
        expect(async.config().maxConcurrency).to.equal(1000000);
    });
});

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

    it('updates maxConcurency to the specified value', function () {
        async.config({ maxConcurrency: 17 });
        expect(async.config().maxConcurrency).to.equal(17);
        async.config({ maxConcurrency: 1000000 });
        expect(async.config().maxConcurrency).to.equal(1000000);
    });

    it('leaves omitted config values unchanged', function () {
        async.config({ maxConcurrency: 17 });
        expect(async.config().maxConcurrency).to.equal(17);
        async.config({});
        async.config({ maxConcurrency: undefined });
        async.config({ maxConcurrency: null });
        expect(async.config().maxConcurrency).to.equal(17);
    });

    it('applies the specified maxConcurrency setting to subsequent operations', function (done) {
        function doTasks(maxConcurrency) {
            started = finished = 0;
            async.config({ maxConcurrency: maxConcurrency });
            return Promise.all([opA(), opA(), opA(), opA(), opA(), opB()]).then(function (r) {
                return r[5];
            });
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
//# sourceMappingURL=async.config.js.map
