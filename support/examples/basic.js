var fs = require('fs');
var Promise = require('bluebird');
//TODO: enable debugging
//var async = require('asyncawait/async');
//var await = require('asyncawait/await');
var async = require('../../async');
var await = require('../../await');
//TODO: for maxConcurrency testing...
var use = require('../../src/use');
var maxConcurrency = require('../../mods/maxConcurrency');
use(maxConcurrency(1));


// A function that returns a promise.
function delay(milliseconds) {
    return Promise.delay(milliseconds);
}

// A thunked version of fs.readFile.
function readFile(filename) {
    return function (callback) {
        return fs.readFile(filename, callback);
    };
}

// A slow asynchronous function, written in async/await style.
var longCalculation = async (function calc(seconds, result) {
    await (delay(seconds * 1000));
    return result;
});

// Another synchronous-looking function written in async/await style.
var program = async (function prog() {
    try  {
        console.log('zero...');

        var msg = await (longCalculation(1, 'one...'));
        console.log(msg);

        msg = await (longCalculation(1, 'two...'));
        console.log(msg);

        msg = await (longCalculation(1, 'three...'));
        console.log(msg);

        var file = await (readFile('NonExistingFilename'));

        msg = await (longCalculation(1, 'four...'));
        console.log(msg);
    } catch (ex) {
        console.log('Caught an error');
    }
    return 'Finished!';
});


// Execute program() and print the result.
program().then(function (result) {
    console.log(result);
});
//TODO: for maxConcurrency testing...
program().then(function (result) {
    console.log(result);
});

// Outputs (with one second delays between the numbers):
// zero...
// one...
// two...
// three...
// Caught an error
// Finished!
