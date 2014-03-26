var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var Buffer = require('buffer').Buffer;
var _ = require('lodash');
var async = require('../async');
var await = require('../await');

/**
  * Finds the largest file in the given directory, optionally performing a recursive search.
  * PARAMETERS:
  * - dir: string
  * - options?: { recurse?: boolean; preview?: boolean }
  * RETURNS:
  * - undefined if no files found -or-
  * - { path: string; size: number; preview?: string, searched: number; }
  */
var largest = async (function (dir, options, internal) {
    options = options || largest.options;

    // Enumerate all files and subfolders in 'dir' to get their stats.
    var files = await (fs.readdirAsync(dir));
    var paths = _.map(files, function (file) { return path.join(dir, file); });
    var stats = await (_.map(paths, function (path) { return fs.statAsync(path); }));
    var sizes = _.map(stats, function (stat) { return stat.size; });

    // Find the largest file, recursing into subfolders if requested.
    var best = undefined; // index into paths/sizes arrays of largest file considered so far.
    var searched = 0; // number of files/folders considered so far.
    await (_.map(stats, async (function (stat, i) { // NB: use an async function here so _.map runs in parallel,
                                                    // but we get blocking semantics in the inner function.
        var isSubdir = stat.isDirectory();
        if (isSubdir) {
            var subdirLargest = options.recurse ? await (largest(paths[i], options, true)) : null;
            if (subdirLargest) paths[i] = subdirLargest.path, sizes[i] = subdirLargest.size;
        }
        searched += (subdirLargest ? subdirLargest.searched : 1); // Keep track of how many files/folders looked at.
        if (best === undefined) {
            if (!isSubdir || subdirLargest) best = i; // If no current best, take the first file/folder considered.
        } else {
            if (sizes[i] > sizes[best]) best = i; // If there's already a best candidate, compare and update best.
        }
    })));

    // If there were no files, return undefined now.
    if (best === undefined) return undefined;

    // Return path, size, and searched in a single result. Also include a preview if requested.
    var result = { path: paths[best], size: sizes[best], searched: searched };
    if (options.preview && !internal) { // Skip the preview if this is an internal step in a recursive search.
        var fd = await (fs.openAsync(paths[best], 'r'));
        var buffer = new Buffer(40);
        var bytesRead = await (fs.readAsync(fd, buffer, 0, 40, 0));
        result.preview = buffer.toString('utf-8', 0, bytesRead);
    }
    return result;
});
largest.options = {};


function nodeified(dir, options, callback) {
    if (arguments.length == 2) callback = options, options = null;
    largest(dir, options).nodeify(callback);
}
module.exports = nodeified;


//TODO: remove...
nodeified(path.join(__dirname, '.'), { recurse: false, preview: true }, function (err, result) {
    console.log(err || result);
});
