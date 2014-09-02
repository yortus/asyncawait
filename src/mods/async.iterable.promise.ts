import references = require('references');
import assert = require('assert');
import Promise = require('bluebird');
import _ = require('../util');
import async = require('../async');
export = mod;


//TODO:...
var promiseProtocol = async.getVariant('async.promise').protocol.members;



function override2(base, options) {
    return {

        begin: (fi: Fiber) => {
            console.log('begin');
            var next = <any> function () {

                //TODO: handle args generically... Don't assume no args
                return promiseProtocol.begin(fi);
            };
            var it = new AsyncIterator(next);
            return it;
        },
        suspend: (fi, error?, value?) => {
            console.log('suspend with ' + (error || value));
            if (error) throw error; // NB: not handled - throw in fiber
            var result = { done: false, value: value };
            promiseProtocol.end(fi, null, result);
            _.yieldCurrentFiber();
        },
        resume: (fi, error?, value?) => {
            console.log('resume with ' + (error || value));
            return base.resume(fi, error, value);
        },
        end: (fi, error?, value?) => {
            console.log('end with ' + (error || value));
            //TODO: handle errors...
            var result = { done: true };
            promiseProtocol.end(fi, null, result);
        }
    };
}

//function createNextFunc(fi: Fiber) {

//    var variant = 'promise'; //TODO: generalise this...
//    var next = async[variant] (() => {
//        var result = fi.resume(); // Will suspend until fi yields
//        return result;
//    });

//    return next;
//}




var mod = {

    name: 'async.iterable.promise',

    base: '',

    override: <any> override2,

    //overrideOLD: (base, options) => ({

    //    begin: (fi) => {
    //        var ctx = fi.context = { nextResolver: null, done: false };
    //        var next = () => {
    //            var res = ctx.nextResolver = Promise.defer<any>();
    //            if (ctx.done) res.reject(new Error('iterated past end')); else fi.resume();
    //            return ctx.nextResolver.promise;
    //        }
    //        return <any> new AsyncIterator(next);
    //    },

    //    suspend: (fi, error?, value?) => {
    //        if (error) throw error; // NB: not handled - throw in fiber
    //        fi.context.nextResolver.resolve({ done: false, value: value });
    //        _.yieldCurrentFiber();
    //    },

    //    end: (fi, error?, value?) => {
    //        var ctx = fi.context;
    //        ctx.done = true;
    //        if (error) ctx.nextResolver.reject(error); else ctx.nextResolver.resolve({ done: true, value: value });
    //    }
    //})
};


//TODO: also support send(), throw(), close()...
//TODO: see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators
//TODO: also for other iterable variants...
class AsyncIterator {

    constructor(public next: () => Promise<any>) { }

    //forEach(callback: (value) => void) {

    //    // Ensure that a single argument has been supplied, which is a function.
    //    assert(arguments.length === 1, 'forEach(): expected a single argument');
    //    assert(_.isFunction(callback), 'forEach(): expected argument to be a function');

    //    // Asynchronously call next() until done.
    //    var result = Promise.defer<void>();
    //    var stepNext = () => this.next().then(stepResolved, err => result.reject(err));
    //    var stepResolved = item => {
    //        if (item.done) return result.resolve(item.value);
    //        callback(item.value);
    //        setImmediate(stepNext);
    //    }
    //    stepNext();
    //    return result.promise;
    //}
}
