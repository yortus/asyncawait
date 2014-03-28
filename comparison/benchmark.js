var path = require('path');
var async = require('async'); // NB: async is used here in the benchmarking code, in case co or
                              // asyncawait won't run on the version of node being benchmarked.
var _ = require('lodash');


// Functions available for benchmarking
var functions = {
    countFiles: 'countFiles',
    largest: 'largest'
};

// Variants available for benchmarking.
var variants = {
    async: 'async',
    asyncawait: 'asyncawait',
    callbacks: 'callbacks',
    co: 'co',
    synchronous: 'synchronous'
};


// ================================================================================
// Benchmark configuration - adjust to suit.

var SELECTED_FUNCTION = functions.largest;

var SELECTED_VARIANT = variants.asyncawait;

var SAMPLES_PER_RUN = 1000;   // How many times the function will be called per run

var RUNS_PER_BENCHMARK = 10;  // How many runs make up the whole benchmark

var JUST_CHECK_THE_FUNCTION = false; // If true, just call the function once and display its results

// ================================================================================


// Run the benchmark (or just check the function).
if (JUST_CHECK_THE_FUNCTION) {
    var name = SELECTED_FUNCTION + '-' + SELECTED_VARIANT;
    var sample = createSampleFunction();
    console.log("========== CHECKING '" + name + "': ==========");
    sample(function(err, result) {
        console.log(err || result);
    });
} else {
    benchmark();
}


function benchmark() {
    var name = SELECTED_FUNCTION + '-' + SELECTED_VARIANT;
    var sample = createSampleFunction();
    console.log('========== PERFORMING ' + RUNS_PER_BENCHMARK + " RUNS ON '" + name + "': ==========");
    var times = [];
    async.timesSeries(
        RUNS_PER_BENCHMARK,
        function(n, next) {
            process.stdout.write('RUN ' + (n + 1));
            run(sample, function(err, elapsed) {
                if (err) {
                    next(err);
                } else {
                    times.push(elapsed);
                    var msg = SAMPLES_PER_RUN
                        + ' samples took '
                        + (elapsed / 1000.0)
                        + ' seconds ('
                        + (SAMPLES_PER_RUN * 1000.0 / elapsed)
                        + ' samples/sec)';
                    console.log(msg);
                    next();
                }
            });
        },
        function(err) {
            if (err) {
                console.log(err);
                process.exit();
            } else {
                totalTime = _.reduce(times, function (sum, time) { return sum + time; });
                var averageTime = totalTime / RUNS_PER_BENCHMARK;
                    var msg = 'Average time: '
                        + (averageTime / 1000.0)
                        + ' seconds ('
                        + (SAMPLES_PER_RUN * 1000.0 / averageTime)
                        + ' samples/sec)';
                console.log('========== ' + msg + ' ==========');
            }
        });

}



function run(sample, callback) {
    var start = new Date().getTime();
    async.timesSeries(
        SAMPLES_PER_RUN,
        function(n, next) {
            process.stdout.write('.');
            sample(next);
        },
        function(err) {
            process.stdout.write('\n');
            if (err) { callback(err); return; }
            var elapsed = new Date().getTime() - start;
            callback(null, elapsed);
        });
};


function createSampleFunction() {
    var selectedFunction = require('./' + SELECTED_FUNCTION + '/' + SELECTED_FUNCTION + '-' + SELECTED_VARIANT);
    switch (SELECTED_FUNCTION) {
        case functions.largest:
            var dirToCheck = path.join(__dirname, '.');
            var options = { recurse: true, preview: true };
            var sample = function (callback) { selectedFunction(dirToCheck, options, callback); };
            break;

        case functions.countFiles:
            var dirToCheck = path.join(__dirname, '.');
            var sample = function (callback) { selectedFunction(dirToCheck, callback); };
    }
    return sample;
}
