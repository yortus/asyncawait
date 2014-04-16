var fs = require('fs');
var Promise = require('bluebird');
var async = require('..').async;
var await = require('..').await;


var ITER = async.mod({ isIterable: true, callbackArg: 'required', returnValue: 'promise' });


var someNums = ITER (function (yield_) {
    await (Promise.delay(500));
    yield_(111);
    await (Promise.delay(500));
    yield_(222);
    await (Promise.delay(500));
    yield_(333);
    await (Promise.delay(500));
});


var program = function() {
    var iterator = someNums();

    iterator.forEach(console.log, function (err) {
        console.log('Finished (callback)!');
    }).then(function () {
        console.log('Finished (promise)!');
    });
}


console.log('running...');
program();
