import references = require('references');
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import PromiseProtocol = require('../async/impl/protocols/promise');
var expect = chai.expect;


var XProtocol = (resume, suspend, options) => {
    options = options || {};
    var prefix = options.prefix || '';
    var suffix = options.suffix || '';
    var resolver = Promise.defer<any>();
    var result =  {
        create: () => { setImmediate(resume); return resolver.promise; },
        delete: () => {},
        return: result => resolver.resolve(prefix + result + suffix),
        throw: error => resolver.reject(prefix + error.message + suffix),
        yield: value => resolver.progress(value)
    };
    return result;
}




describe('async.mod(...)', () => {

    it('returns a new async function defaulting to the same protocol', done => {
        var a2 = (<any> async.mod)();//TODO:...fix
        expect(a2).to.exist;
        expect(a2).to.not.equal(async);
        var fn = a2((n: number) => 111 * n);
        fn(7)
        .then(r => expect(r).to.equal(777))
        .then(() => done())
        .catch(done);
    });

    it('returns an async function that uses the specified protocol', done => {
        var asyncX = async.mod(<any> XProtocol);//TODO:...fix
        var fn = asyncX (msg => msg);
        fn('BLAH!')
        .then(r => expect(r).to.equal('BLAH!'))
        .then(() => done())
        .catch(done);
    });

    it('returns an async function that uses the specified protocol options', done => {
        var asyncX = (<any> async.mod)(XProtocol, { prefix: '<<<', suffix: '>>>' });//TODO:...fix
        var fn = asyncX (msg => msg);
        fn('BLAH!')
        .then(r => expect(r).to.equal('<<<BLAH!>>>'))
        .then(() => done())
        .catch(done);
    });
});
