var fs = require('fs');
var Promise = require('bluebird');
var async = require('../..').async;
var await = require('../..').await;
var yield_ = require('../..').yield;


var someNums = async.iterable (function () {

    var p = Promise.delay(500);
    await (p);
    yield_(111);
    p = Promise.delay(500);
    await (p);
    yield_(222);
    await (Promise.delay(500));
    yield_(333);
    await (Promise.delay(500));
    return 'hi';
});


var program = async (function() {
    var iterator = someNums();

    //await (iterator.forEach(console.log));
    // or the long (but equivalent) way...
    while (true) {
        var next = iterator.next;
        var p = next();
        var item = await (p);
        if (item.done) break;
        console.log(item.value);
    }

    return 'Finished!';
});


console.log('running...');
program()
    .then(function (result) {
        console.log(result);
    })
    .catch(function(err) {
        console.log('----- rejected: -----');
        console.log(err);
    });
