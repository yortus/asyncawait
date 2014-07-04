//var Promise = require('bluebird');
//var fs = Promise.promisifyAll(require('fs'));
var fs = require('fs');
var path = require('path');
var Buffer = require('buffer').Buffer;
var _ = require('lodash');
var async = require('../..').async;
var await = require('../..').await;
var __ = await.cps;


/**
  * Finds the largest file in the given directory, optionally performing a recursive search.
  * @param {string} dir - the directory to search.
  * @param {object?} options - optional settings: { recurse?: boolean; preview?: boolean }.
  * @returns {object?} null if no files found, otherwise an object of the form
  *                    { path: string; size: number; preview?: string, searched: number; }.
  */

//TODO: remove 'internal' from others too (to be fair)

var largest = async.cps (function self(dir, options) {

    // Parse arguments.
    options = options || defaultOptions;

    // Enumerate all files and subfolders in 'dir' to get their stats.
    var files = await.cps (fs.readdir(dir, __.__));
    var paths = _.map(files, function (file) { return path.join(dir, file); });
    var stats = _.map(paths, function (path) { return await.cps (fs.stat(path, __.__)); });

    // Build up a list of possible candidates, recursing into subfolders if requested.
    var candidates = await (_.map(stats, function (stat, i) {
        if (stat.isFile()) return { path: paths[i], size: stat.size, searched: 1 };
        return options.recurse ? self(paths[i], recurseOptions, true) : null;
    }));

    // Choose the best candidate.
    var result = _(candidates)
        .compact()
        .reduce(function (best, cand) {
            if (cand.size > best.size) var temp = cand, cand = best, best = temp;
            best.searched += cand.searched;
            return best;
        });

    // Add a preview if requested.
    if (result && options.preview) {
        var fd = await.cps (fs.open(result.path, 'r', __.__));
        var buffer = new Buffer(40);
        var bytesRead = await.cps (fs.read(fd, buffer, 0, 40, 0, __.__));
        result.preview = buffer.toString('utf-8', 0, bytesRead);
        await.cps (fs.close(fd, __._));
    }
    return result;
});


var defaultOptions = { recurse: false, preview: false };
var recurseOptions = { recurse: true,  preview: false };


module.exports = largest;
