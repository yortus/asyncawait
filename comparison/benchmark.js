var path = require('path');
var async = require('async'); // NB: async is used here in the benchmarking code, in case co or
                              // asyncawait won't run on the version of node being benchmarked.
var _ = require('lodash');


// Functions available for benchmarking.
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

var CONCURRENCY_FACTOR = 100;  // Max number of concurrent invocations of the function

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
    console.log('========== PERFORMING ' + RUNS_PER_BENCHMARK + " RUNS ON '" + name + "': ==========\n");
    var times = [];
    async.timesSeries(
        RUNS_PER_BENCHMARK,
        function (n, next) {
            process.stdout.write('RUN ' + (n + 1));
            run(sample, function (err, timing) {
                if (err) {
                    next(err);
                } else {
                    times.push(timing.totalElapsed);
                    var msg = SAMPLES_PER_RUN
                        + ' samples took '
                        + (timing.totalElapsed / 1000.0)
                        + ' seconds ('
                        + (SAMPLES_PER_RUN * 1000.0 / timing.totalElapsed)
                        + ' samples/sec), average latency per sample: '
                        + timing.perSample + 'ms\n';
                    console.log(msg);
                    next();
                }
            });
        },
        function (err) {
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
    var chars = './#$@%^&*+!=-?~`|()[]ABCDEFGHIJKLMNOPQRS';
    var start = new Date().getTime();
    var sumOfTimePerSample = 0.0;
    async.times(
        CONCURRENCY_FACTOR,
        function (m, nextOuter) {
            var char = chars.charAt(m % chars.length);
            async.timesSeries(
                1.0 * SAMPLES_PER_RUN / CONCURRENCY_FACTOR,
                function (n, nextInner) {
                    process.stdout.write(char);
                    var start = new Date().getTime();
                    sample(function() {
                        var end = new Date().getTime();
                        sumOfTimePerSample += (end - start);
                        nextInner();
                    });
                },
                function (err) {
                    nextOuter(err);
                }
            );
        },
        function(err, res) {
            process.stdout.write('\n');
            if (err) { callback(err); return; }
            var perSample = sumOfTimePerSample / SAMPLES_PER_RUN;
            var totalElapsed = new Date().getTime() - start;
            callback(null, { perSample: perSample, totalElapsed: totalElapsed });
        }
    );
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
