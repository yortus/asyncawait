var fs = require('fs');
var Promise = require('bluebird');
var async = require('../async');
var await = require('../await');
var iterable = require('../iterable');
var yield_ = require('../yield');


var someNums = iterable (function () {

    await (Promise.delay(500));
    
    yield_(1);
    await (Promise.delay(500));
    yield_(2);
    await (Promise.delay(500));
    yield_(3);

    await (Promise.delay(500));
});


var program = async (function() {
    var iterator = someNums();
    while (true) {
        var item = iterator.next();
        if (await (item.done)) break;
        console.log(await (item.value));
    }
    return 'Finished!';
});


console.log('running...');
program().then(function (result) {
    console.log(result);
});
