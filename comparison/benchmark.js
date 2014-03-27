var path = require('path');
var async = require('async'); // Use async in case co or asyncawait won't run on the version of node being benchmarked.
var _ = require('lodash');


// Available variants of largest() for benchmarking.
var variants = {
    async: 'async',
    asyncawait: 'asyncawait',
    callbacks: 'callbacks',
    co: 'co',
    synchronous: 'synchronous'
};


// Benchmark configuration - please adjust to suit.
var LARGEST_DIR = path.join(__dirname, '.');
var SAMPLES_PER_RUN = 1000;
var RUNS_PER_BENCHMARK = 10;
var SELECTED_VARIANT = variants.asyncawait;


// Run the benchmark.
var largest = require('./largest-' + SELECTED_VARIANT);
benchmark();


function benchmark() {
    console.log('========== PERFORMING ' + RUNS_PER_BENCHMARK + " RUNS ON '" + SELECTED_VARIANT + "': ==========");
    var times = [];
    async.timesSeries(
        RUNS_PER_BENCHMARK,
        function(n, next) {
            process.stdout.write('RUN ' + (n + 1));
            run(function(err, elapsed) {
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


function sample(callback) {
    largest(LARGEST_DIR, { recurse: true, preview: true }, callback);
}
