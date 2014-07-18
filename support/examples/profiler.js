var fs = require('fs');
var Promise = require('bluebird');
var async = require('../../async');
var await = require('../../await');
//var use = require('../../src/use');
//var maxConcurrency = require('../../mods/maxConcurrency');
//var continuationOperator = require('../../mods/continuationOperator');
//use(continuationOperator('___'));
//use(maxConcurrency(1));


var counter = 0, n = 25000;
var startTime = new Date().getTime();


// ========== async.cps ==========
var program = async.cps (function prog(a) {
    //return await (a);
    return a;
});
function doOne() { program(1, doneOne); }
doOne();
function doneOne(err, val) {
    if (err) return console.log(err);
    ++counter;
    if (counter < n) {
        doOne();
        //setImmediate(doOne);
    }
    else {
        console.log('results: ' + n);
        var endTime = new Date().getTime();
        console.log('seconds: ' + ((endTime - startTime) / 1000.0));
    }
}


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
