var chai = require('chai');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var yield_ = require('asyncawait/yield');
var expect = chai.expect;

describe('A suspendable function returned by async.express(...)', function () {
    var foo = async.express(function (rq, rs) {
        rs.post = rs.pre;
        if (rq instanceof Error)
            throw rq;
        yield_(rq);
        return rq;
    });

    function nullFunc() {
    }

    it('synchronously returns nothing', function () {
        var syncResult = foo(null, null, nullFunc);
        expect(syncResult).to.not.exist;
    });

    it('throws if a callback is not supplied after the other arguments', function () {
        var bar = foo;
        expect(function () {
            return bar();
        }).to.throw(Error);
        expect(function () {
            return bar(1);
        }).to.throw(Error);
        expect(function () {
            return bar('a', 'b');
        }).to.throw(Error);
        expect(function () {
            return bar('a', 'b', 'c');
        }).to.throw(Error);
    });

    it('executes its definition asynchronously', function (done) {
        var rs = { pre: 'abc', post: null };
        Promise.promisify(foo)('next', rs).then(function () {
            return expect(rs.post).to.equal('abc');
        }).then(function () {
            return done();
        }).catch(done);
        expect(rs.pre).to.exist;
    });

    it('eventually rejects if its definition\'s return value is not falsy or \'next\' or \'route\'', function (done) {
        var err, rs = { pre: 'abc', post: null };
        Promise.promisify(foo)('blah', rs).catch(function (err_) {
            return err = err_;
        }).finally(function () {
            return done(err ? null : new Error('Expected function to throw'));
        });
    });

    it('never calls next(...) if its definition\'s return value is falsy', function (done) {
        var returned, rs = { pre: 'xxx', post: null };
        Promise.promisify(foo)(undefined, rs).finally(function () {
            return returned = true;
        });
        Promise.delay(50).then(function () {
            return done(returned ? new Error('Expected next(...) to remain uncalled') : null);
        });
    });

    it('eventually calls next() if its definition\'s return value is \'next\'', function (done) {
        var val, rs = { pre: 'abc', post: null };
        Promise.promisify(foo)('next', rs).then(function (val_) {
            return val = val_;
        }, function (err) {
            return val = err;
        }).finally(function () {
            return done(!val ? null : new Error('Expected next() to be called'));
        });
    });

    it('eventually calls next(\'route\') if its definition\'s return value is \'route\'', function (done) {
        var val, err, rs = { pre: 'abc', post: null };
        Promise.promisify(foo)('route', rs).then(function (val_) {
            return val = val_;
        }, function (err) {
            return val = err.message;
        }).finally(function () {
            return done(val === 'route' ? null : new Error('Expected next(\'route\') to be called'));
        });
    });

    it('eventually rejects with its definition\'s thrown value', function (done) {
        var act, exp = new Error('Expected thrown value to match rejection value');
        var val, err, rs = { pre: 'abc', post: null };
        Promise.promisify(foo)(exp, rs).catch(function (err) {
            return act = err;
        }).finally(function () {
            return done(act && act.message === exp.message ? null : exp);
        });
    });

    it('ignores yielded values', function (done) {
        var yields = [], rs = { pre: 'abc', post: null };
        Promise.promisify(foo)('next', rs).progressed(function (value) {
            return yields.push(value);
        }).then(function () {
            return expect(yields).to.be.empty;
        }).then(function () {
            return done();
        }).catch(done);
    });
});
//# sourceMappingURL=async.express.js.map
