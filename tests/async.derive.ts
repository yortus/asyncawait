import references = require('references');
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
var expect = chai.expect;


var customProtocolFactory = (options, baseProtocol) => {
    var prefix = options.prefix || '';
    var suffix = options.suffix || '';
    return {
        return: (co, result) => baseProtocol.return(co, prefix + result + suffix),
        throw: (co, error) => baseProtocol.throw(co, new Error(prefix + error.message + suffix))
    };
};


describe('async.derive(...)', () => {

    it('returns a new async function defaulting to the same protocol', done => {
        var a2 = async.derive({});
        expect(a2).to.exist;
        expect(a2).to.not.equal(async);
        var fn = a2((n: number) => 111 * n);
        fn(7)
        .then(r => expect(r).to.equal(777))
        .then(() => done())
        .catch(done);
    });

    it('returns an async function that uses the specified protocol', done => {
        var asyncX = async.derive(customProtocolFactory);
        var fn = asyncX (msg => msg);
        fn('BLAH!')
        .then(r => expect(r).to.equal('BLAH!'))
        .then(() => done())
        .catch(done);
    });

    it('returns an async function that uses the specified protocol options', done => {
        var asyncX = async.derive(customProtocolFactory).derive({ prefix: '<<<', suffix: '>>>' });
        var fn = asyncX (msg => msg);
        fn('BLAH!')
        .then(r => expect(r).to.equal('<<<BLAH!>>>'))
        .then(() => done())
        .catch(done);
    });
});
