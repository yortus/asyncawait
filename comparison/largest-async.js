var Promise = require('bluebird');
var fs = require('fs');
var pathJoin = require('path').join;
var Buffer = require('buffer').Buffer;
var _ = require('lodash');
var async = require('async');


/**
  * FUNCTION: largest-async (see https://github.com/caolan/async)
  * Finds the largest file in the given directory, optionally performing a recursive search.
  *
  * PARAMETERS:
  * - dir: string
  * - options?: { recurse?: boolean; preview?: boolean }
  *
  * RETURNS:
  * - null if no files found -or-
  * - { path: string; size: number; preview?: string, searched: number; }
  */
var largest = function (dir, options, internal, callback) {

    // Parse arguments
    options = options || largest.options;
    if (arguments.length == 3) callback = internal, internal = null;

    async.waterfall([
        function (callback) {

            // Build up a list of possible candidates, recursing into subfolders if requested.
            var candidates = [];
            fs.readdir(dir, function (err, files) { // Get list of files/subdirs in dir.
                if (err) callback(err);
                async.each(files, function(file, next) { // Process each file/subdir in parallel.
                    var path = pathJoin(dir, file);
                    fs.stat(path, function (err, stat) { // stat() the file/subdir.
                        if (err) next(err);
                        if (stat.isFile()) {
                            candidates.push({ path: path, size: stat.size, searched: 1 });
                            next();
                        } else if (!options.recurse) {
                            next();
                        } else {
                            largest(path, options, true, function (err, cand) { // recurse
                                if (err) next(err);
                                if (cand) candidates.push(cand);
                                next();
                            });
                        }
                    });
                }, function (err) {
                    if (err) callback(err);
                    callback(null, candidates);
                });
            });
        },
        function (candidates, callback) {

            // Choose the best candidate.
            var result = _(candidates)
                .reduce(function (best, cand) {
                    if (cand.size > best.size) var temp = cand, cand = best, best = temp;
                    best.searched += cand.searched;
                    return best;
                });
            callback(null, result);
        },
        function (result, callback) {

            // Add a preview if requested (but skip if this is an internal step in a recursive search).
            if (result && options.preview && !internal) {
                async.waterfall([
                    function(callback) {
                        fs.open(result.path, 'r', callback);
                    },
                    function(fd, callback) {
                        var buffer = new Buffer(40);
                        fs.read(fd, buffer, 0, 40, 0, callback);
                    },
                    function(bytesRead, buffer, callback) {
                        result.preview = buffer.toString('utf-8', 0, bytesRead);
                        callback(null, result);
                    }
                ], callback);
            } else {
                callback(null, result); // Return without adding preview.
            }
        }
    ], callback);
};
largest.options = {};


module.exports = largest;


////TODO: remove...
//largest(pathJoin(__dirname, '.'), { recurse: true, preview: true }, function (err, result) {
//    console.log(err || result);
//});
