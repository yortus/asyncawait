import references = require('references');
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
var expect = chai.expect;


var overrideMethod1 = (base, options) => {
    options = options || {};
    var prefix = options.prefix || '';
    var suffix = options.suffix || '';
    var resolver = Promise.defer<any>();
    var result =  {
        create: () => { setImmediate(() => base.resume()); return resolver.promise; },
        delete: () => {},
        return: result => resolver.resolve(prefix + result + suffix),
        throw: error => resolver.reject(prefix + error.message + suffix),
        yield: value => resolver.progress(value)
    };
    return result;
}
//var overrideMethod2 = (base: AsyncAwait.Protocol, options) => {
//    options = options || {};
//    var prefix = options.prefix || '';
//    var suffix = options.suffix || '';
//    var resolver = Promise.defer<any>();
//    base.create = () => { setImmediate(() => base.resume()); return resolver.promise; };
//    base.return = result => resolver.resolve(prefix + result + suffix);
//    base.throw = error => resolver.reject(prefix + error.message + suffix);
//    base.yield = value => resolver.progress(value);
//    return base;
//}


describe('async.mod(...)', () => {

    it('returns a new async function defaulting to the same protocol', done => {
        var a2 = async.mod();
        expect(a2).to.exist;
        expect(a2).to.not.equal(async);
        var fn = a2((n: number) => 111 * n);
        fn(7)
        .then(r => expect(r).to.equal(777))
        .then(() => done())
        .catch(done);
    });

    it('returns an async function that uses the specified protocol', done => {
        var asyncX = async.cps.mod(overrideMethod1);
        //var asyncX2 = async.cps.mod(overrideMethod2);
        var fn = asyncX (msg => msg);
        //var fn2 = asyncX2 (msg => msg);
        fn('BLAH!')
        .then(r => expect(r).to.equal('BLAH!'))
        //.then(() => fn2('BLAH!'))
        //.then(r => expect(r).to.equal('BLAH!'))
        .then(() => done())
        .catch(done);
    });

    it('returns an async function that uses the specified protocol options', done => {
        var asyncX = async.mod(overrideMethod1).mod({ prefix: '<<<', suffix: '>>>' });
        //var asyncX2 = async.mod(overrideMethod2).mod({ prefix: '<<<', suffix: '>>>' });
        var fn = asyncX (msg => msg);
        //var fn2 = asyncX2 (msg => msg);
        fn('BLAH!')
        .then(r => expect(r).to.equal('<<<BLAH!>>>'))
        //.then(() => fn2('BLAH!'))
        //.then(r => expect(r).to.equal('<<<BLAH!>>>'))
        .then(() => done())
        .catch(done);
    });
});
