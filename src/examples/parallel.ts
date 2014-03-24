import _refs = require('_refs');
import fs = require('fs');
import Promise = require('bluebird');
var async: AsyncAwait.IAsync = require('../async');
var await: AsyncAwait.IAwait = require('../await');

// A thunked version of fs.readFile
function readFile(filename) {
    return (callback) => fs.readFile(filename, callback);
}

// A slow asynchronous function, written in async/await style
var longCalculation = async (function(seconds: number, result) {
    console.log('Starting ' + result);
    await(Promise.delay(seconds * 1000));
    return result;
});

// An async/await style function with both sequential and parallel operations
var compoundOperation = async (function() {
    console.log('A: zero');

    var result1 = await ([
        longCalculation(1, 'A: one'),
        1.5,
        longCalculation(1, 'A: two'),
        readFile(__filename),
        {
             three: longCalculation(1, 'A: three'),
             four: longCalculation(1, 'A: four'),
             five: 'five'
        }
    ]);
    console.log(result1);

    var result2 = await ({
        k1: longCalculation(1, 'B: one'),
        k2: longCalculation(1, 'B: two'),
        k3: [
            longCalculation(1, 'B: three'),
            longCalculation(1, 'B: four'),
            5,
            'six'
        ]
    });
    console.log(result2);

    return 'Finished!';
});

// Start the compound operation
compoundOperation().then(function(result) {
    console.log(result);
});
