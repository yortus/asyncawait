var fs = require('fs');
var Promise = require('bluebird');
var async = require('../async');
var await = require('../await');
var iterable = require('../iterable');
var yield_ = require('../yield');


var someNums = iterable (function () {

    await (Promise.delay(500));
    yield_(111);
    await (Promise.delay(500));
    yield_(222);
    await (Promise.delay(500));
    yield_(333);
    await (Promise.delay(500));
});


var program = async (function() {
    var iterator = someNums();

    while (true) {
        var item = iterator.next();
        if (await(item.done)) break;
        console.log(await(item.value));
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
