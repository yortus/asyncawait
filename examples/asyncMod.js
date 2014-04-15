var fs = require('fs');
var Promise = require('bluebird');
var async = require('..').async;
var await = require('..').await;


var ITER = async.mod({ isIterable: true, callbackArg: 'none', returnValue: 'none' });
ITER.config.callbackArg = 'required';


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
        console.log('Finished!');
    });
}


console.log('running...');
program();
