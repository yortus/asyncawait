var fs = require('fs');
var Promise = require('bluebird');
var async = require('../async');
var await = require('../await');
var iterable = require('../iterable');
var yield_ = require('../yield');


var someNums = iterable (function () {
    console.log('in someNums()');

    await (Promise.delay(500));
    
    yield_(1);
    yield_(2);
    yield_(3);
});


var program = async (function() {
    var iterator = someNums();
    while (true) {
        console.log('---');
        var item = iterator.next();
        console.log('###');
        if (await (item.done)) break;
        console.log('///');
        console.log(await (item.value));
    }
    return 'Finished!';
});


console.log('running...');
program().then(function (result) {
    console.log(result);
});
