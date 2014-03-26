var path = require('path');
var async = require('async');

//==================================================
// Uncomment only the one you want to benchmark.
//var largest = require('./largest-async');
var largest = require('./largest-asyncawait');
//var largest = require('./largest-callbacks');
//var largest = require('./largest-co');
//var largest = require('./largest-synchronous');
//==================================================


var SAMPLES_PER_RUN = 1000;


function sample(callback) {
    largest(path.join(__dirname, '.'), callback);
}


function run(callback) {
    var start = new Date().getTime();
    async.timesSeries(
        SAMPLES_PER_RUN,
        function(n, next) {
            process.stdout.write('.');
            sample(next);
        },
        function(err) {
            process.stdout.write('\n');
            if (err) callback(err);
            var elapsed = new Date().getTime() - start;
            callback(null, elapsed);
        });
};


function benchmark() {

    process.stdout.write('SAMPLING');
    run(function(err, ms) {
        if (err) {
            console.log(err);
        } else {
            console.log(SAMPLES_PER_RUN + ' samples took ' + (ms / 1000.0) + ' seconds (' + (SAMPLES_PER_RUN * 1000.0 / ms) + ' samples/sec)');
        }
    });
}


benchmark();
