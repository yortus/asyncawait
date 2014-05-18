import references = require('references');
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import PromiseProtocol = require('../async/impl/protocols/promise');
var expect = chai.expect;


class XProtocol extends PromiseProtocol {
    constructor(public opts) { super(); this.prefix = opts.prefix || ''; this.suffix = opts.suffix || ''; }
    return(value) { super.return(this.prefix + value + this.suffix); }
    throw(err) { super.throw(new Error(this.prefix + err.message + this.suffix)); }
    prefix: string;
    suffix: string;
}


describe('async.mod(...)', () => {

    it('returns a new async function defaulting to the same protocol', done => {
        var a2 = async.mod({ constructor: null });
        expect(a2).to.exist;
        expect(a2).to.not.equal(async);
        var fn = a2((n: number) => 111 * n);
        fn(7)
        .then(r => expect(r).to.equal(777))
        .then(() => done())
        .catch(done);
    });

    it('returns an async function that uses the specified protocol', done => {
        var asyncX = async.mod({ constructor: XProtocol });
        var fn = asyncX (msg => msg);
        fn('BLAH!')
        .then(r => expect(r).to.equal('BLAH!'))
        .then(() => done())
        .catch(done);
    });

    it('returns an async function that uses the specified protocol options', done => {
        var asyncX = async.mod({ constructor: XProtocol, prefix: '<<<', suffix: '>>>' });
        var fn = asyncX (msg => msg);
        fn('BLAH!')
        .then(r => expect(r).to.equal('<<<BLAH!>>>'))
        .then(() => done())
        .catch(done);
    });
});
