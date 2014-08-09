var fs = require('fs');
var Promise = require('bluebird');
var Fiber = require('fibers');
var async = require('../../async');
var await = require('../../await');
//async.config({
//    cpsKeyword: '___',
//    maxSlots: 2,
//    fiberPool: true,

//    awaitOrder: [ 'promise', 'cps', 'thunk', 'promise[]', 'value' ],

//    //TODO: rename continuation() to complete()
//    keywords: {
//        cps: '___',
//        yield: 'yield_',
//        await: 'await'
//    }
//});


var config = require('../../config');
var options = config.options();





// ========== experiment ==========
    var started = 0, finished = 0;
    var opA = async (function () {
        ++started;
        await (Promise.delay(20));
        ++finished;
    });
    var opB = async (function () {
        return { started: started, finished: finished };
    });
    var setMaxSlots = function (n) {
        config.options({maxSlots: n});
    };


    function doTasks(maxCon) {
        started = finished = 0;
        setMaxSlots(maxCon);
        return Promise
            .all([opA(), opA(), opA(), opA(), opA(), opB()])
            .then(function (r) { return r[5]; });
    }

    doTasks(1)
    //.then(r => expect(r.finished).to.equal(0))
    //.then(() => Promise.delay(40))
    //.then(() => doTasks(1))
    //.then(r => expect(r.finished).to.equal(5))
    //.then(() => Promise.delay(40))
    //.then(() => doTasks(5))
    //.then(r => expect(r.finished).to.be.greaterThan(0))
    //.then(() => Promise.delay(40))
    //.then(() => done())
    //.catch(done);













//var counter = 0, n = 25000;
//var startTime = new Date().getTime();


//// ========== async.cps ==========
////var program = function (a, cb) {
////    (async.cps (function prog(a) {
////        //return await (a);
////        return a;
////    }))(a, cb);
////};
//var program = async.cps (function prog(a) {
//    //return await (Promise.resolve(a));
//    //return await (a);
//    return a;
//    //var result = await ([fs.stat(__filename, ___), fs.stat(__filename, ___), fs.stat(__filename, ___), fs.stat(__filename, ___)]);
//    //return result;
//});
//function doOne() { program(1, doneOne); }
//doOne();
//function doneOne(err, val) {
//    if (err) return console.log(err);
//    ++counter;
//    if (counter < n) {
//        doOne();
//        //setImmediate(doOne);
//    }
//    else {
//        console.log('results: ' + n);
//        var endTime = new Date().getTime();
//        console.log('seconds: ' + ((endTime - startTime) / 1000.0));
//    }
//}


// ========== bluebird ==========
//var program = function prog(a) {
//    return Promise.resolve(a);
//};
//program(1).then(doneOne).catch(console.log);
//function doneOne(val) {
//    ++counter;
//    if (counter < n) {
//        program(1).then(doneOne).catch(console.log);
//    }
//    else {
//        console.log('results: ' + n);
//        var endTime = new Date().getTime();
//        console.log('seconds: ' + ((endTime - startTime) / 1000.0));
//    }
//}
