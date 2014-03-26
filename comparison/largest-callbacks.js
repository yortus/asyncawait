var Promise = require('bluebird');
var fs = require('fs');
var pathJoin = require('path').join;
var Buffer = require('buffer').Buffer;
var _ = require('lodash');



/**
  * FUNCTION: largest-callbacks
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

    // Build up a list of possible candidates, recursing into subfolders if requested.
    function listCandidates(callback) {
        var candidates = [];
        fs.readdir(dir, function (err, files) {
            if (err) { callback(err); return; }
            var remaining = files.length;
            if (remaining > 0) {

                // This function ensures we only call the callback once, despite operating in parallel.
                function next(err) {
                    if (remaining == 0) return;
                    if (err) {
                        remaining = 0;
                        callback(err);
                    } else {
                        --remaining;
                        if (remaining == 0) callback(null, candidates);
                    }
                }

                // Iterate over each file/subdirs in parallel.
                files.forEach(function (file) {
                    var path = pathJoin(dir, file);
                    fs.stat(path, function (err, stat) {
                        if (err) { next(err); return; }
                        if (stat.isFile()) {
                            candidates.push({ path: path, size: stat.size, searched: 1 });
                            next();
                        } else if (!options.recurse) {
                            next();
                        } else {
                            largest(path, options, true, function (err, cand) { // recurse
                                if (err) { next(err); return; }
                                if (cand) candidates.push(cand);
                                next();
                            });
                        }
                    });
                });
            } else {
                callback(null, candidates); // Return with no candidates (empty subfolder).
            }
        });
    }

    // Choose the best candidate.
    function selectBestCandidate(candidates, callback) {
        var result = _(candidates)
            .reduce(function (best, cand) {
                if (cand.size > best.size) var temp = cand, cand = best, best = temp;
                best.searched += cand.searched;
                return best;
            });
        callback(null, result);
    }

    // Add a preview if requested (but skip if this is an internal step in a recursive search).
    function addPreviewIfAppropriate(result, callback) {
        if (result && options.preview && !internal) {
            fs.open(result.path, 'r', function (err, fd) {
                if (err) { callback(err); return; }
                var buffer = new Buffer(40);
                fs.read(fd, buffer, 0, 40, 0, function (err, bytesRead, buffer) {
                    if (err) { callback(err); return; }
                    result.preview = buffer.toString('utf-8', 0, bytesRead);
                    fs.close(fd, function (err) {
                        if (err) callback(err);
                        else callback(null, result);
                    });
                });
            });
        } else {
            callback(null, result); // Return without adding preview.
        }
    }

    // Put it all together.
    listCandidates(function (err, candidates) {
        if (err) { callback(err); return; }
        selectBestCandidate(candidates, function (err, result) {
            if (err) { callback(err); return; }
            addPreviewIfAppropriate(result, callback);
        });
    });
};


module.exports = largest;
