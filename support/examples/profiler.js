var fs = require('fs');
var Promise = require('bluebird');
var async = require('../../async');
var await = require('../../await');
var use = require('../../src/use');
var maxConcurrency = require('../../mods/maxConcurrency');
use(maxConcurrency(1));


var program = async (function prog() {
    return 1;
});


var promises = [];
for (var i = 0; i < 10000; ++i) promises.push(program());
Promise.all(promises)
.then(function (results) {
    console.log('results: ' + results.length);
})
.catch(function (err) {
    console.log('error: ' + err);
});
