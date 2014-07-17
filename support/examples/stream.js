var fs = require('fs');
var Promise = require('bluebird');
var async = require('../..').async;
var await = require('../..').await;
var yield_ = require('../..').yield;


var someNums = async.stream (function () {

    await (Promise.delay(500));
    yield_(111);
    await (Promise.delay(500));
    yield_(222);
    await (Promise.delay(500));
    yield_(333);
    await (Promise.delay(500));
    //throw new Error('!!!');
});


var program = async (function() {
    var stream = someNums();

    stream.on('data', function (data) { console.log('DATA: ' + data); });
    stream.on('error', function (err) { console.log('ERROR: ' + err); });
    stream.on('end', function () { console.log('END!'); });
});


console.log('running...');
program();
