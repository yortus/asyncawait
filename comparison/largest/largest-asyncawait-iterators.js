var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var Buffer = require('buffer').Buffer;
var _ = require('lodash');
var async = require('../..').async;
var await = require('../..').await;


var descendentFileBatches = async.iterable (function self(yield_, dir, recursive) {

    var files = await (fs.readdirSync(dir));
    var paths = _.map(files, function (file) { return path.join(dir, file); });
    var stats = await (_.map(paths, function (path) { return fs.statAsync(path); }));

    // Yield this batch
    yield_ ({ in: dir, paths: paths, stats: stats });

    // Recursively yield each subdirectory, if requested
    if (recursive) {
        _.each(stats, function(stat, i) {
            //TODO: temp testing...
            //if (stat.isDirectory()) descendentFileBatches(paths[i], true).forEach(function (result) { return yield_(result); });

            //TODO: was...
            if (stat.isDirectory()) self(yield_, paths[i], true);
        });
    }
});


/**
  * Finds the largest file in the given directory, optionally performing a recursive search.
  * @param {string} dir - the directory to search.
  * @param {object?} options - optional settings: { recurse?: boolean; preview?: boolean }.
  * @returns {object?} null if no files found, otherwise an object of the form
  *                    { path: string; size: number; preview?: string, searched: number; }
  */
var largest = async (function (dir, options, internal) {

    // Parse arguments
    options = options || largest.options;

    // Enumerate all files and subfolders in 'dir' to get their stats.
    var files = [];
    var fileBatchIterator = descendentFileBatches(dir, options.recurse);
    fileBatchIterator.forEach(function(fileBatch) {
        _.each(fileBatch.paths, function (path, i) {
            files.push({ path: path, stat: fileBatch.stats[i] });
        });
    });

    // Build up a list of possible candidates, recursing into subfolders if requested.
    var candidates = _.map(files, function (file) {
        if (file.stat.isFile()) return { path: file.path, size: file.stat.size, searched: 1 };
        return { path: file.path, size: 0, searched: 0 };
    });

    // Choose the best candidate.
    var result = _(candidates)
        .compact()
        .reduce(function (best, cand) {
            if (cand.size > best.size) var temp = cand, cand = best, best = temp;
            best.searched += cand.searched;
            return best;
        });

    // Add a preview if requested (but skip if this is an internal step in a recursive search).
    if (result && options.preview && !internal) {
        var fd = await (fs.openAsync(result.path, 'r'));
        var buffer = new Buffer(40);
        var bytesRead = await (fs.readAsync(fd, buffer, 0, 40, 0));
        result.preview = buffer.toString('utf-8', 0, bytesRead);
        await (fs.closeSync(fd));
    }
    return result;
});
largest.options = {};


function nodeified(dir, options, callback) {
    if (arguments.length == 2) callback = options, options = null;
    largest(dir, options).nodeify(callback);
}
module.exports = nodeified;
