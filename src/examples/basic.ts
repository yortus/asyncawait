import _refs = require('_refs');
import fs = require('fs');
import Promise = require('bluebird');
import async = require('../async');
import await = require('../await');

// A function that returns a promise
function delay(milliseconds: number) {
    return Promise.delay(milliseconds);
}

// A thunked version of fs.readFile
function readFile(filename) {
    return (callback: (err,val)=>void) => fs.readFile(filename, callback);
}

// A slow asynchronous function, written in async/await style
var longCalculation = async (function(seconds: number, result) {
    await (delay(seconds * 1000));
    return result;
});

// Another synchronous-looking function written in async/await style...
var program = async (function() {
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

program().then(function(result) {
    console.log(result);
});
