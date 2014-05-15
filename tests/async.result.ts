///<reference path="../src/references.ts" />
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import yield_ = require('asyncawait/yield');
var expect = chai.expect;


describe('A suspendable function returned by async.result(...)', () => {

    it('throws if called outside a suspendable function', () => {
        var foo = async.result (() => {});
        expect(() => foo()).to.throw(Error);
    });

    it('pseudo-synchronously returns with its definition\'s returned value', done => {
        var foo = async.result (() => { return 'blah'; });
        var bar = async(() => {
            expect(foo()).to.equal('blah');
        });
        bar().then(() => done(), done);
    });

    it('pseudo-synchronously throws with its definition\'s thrown value', done => {
        var exp = new Error('Expected thrown value to match rejection value');
        var foo = async.result (() => { throw exp; return 'blah'; });
        var bar = async(() => {
            try {
                foo();
            }
            catch (err) {
                if (err !== exp) throw exp;
                return;
            }
            throw new Error("Expected function to throw");
        });
        bar().then(() => done(), done);
    });

    it('ignores yielded values', done => {
        var foo = async.result (() => { yield_(111); yield_(222); yield_(333); return 444; });
        var bar = async(() => {
            expect(foo()).to.equal(444);
        });
        bar().then(() => done(), done);
    });
});
