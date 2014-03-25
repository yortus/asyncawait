var Promise = require('bluebird');
var fs = require('fs');
var pathJoin = require('path').join;
var _ = require('lodash');
var async = require('async');


var largest = function (dir, callback) {

    // Build up a list of possible candidates, recursing into subfolders.
    function listCandidates(callback) {
        var candidates = [];
        fs.readdir(dir, function (err, files) {
            if (err) callback(err);
            var todo = files.length;

            // This function is to ensure we only call the callback once, despite being parallel
            function next(err) {
                if (!todo) return;
                if (err) {
                    todo = 0;
                    callback(err);
                } else {
                    --todo;
                    if (!todo) callback(null, candidates);
                }
            }
            files.forEach(function (file) {
                var path = pathJoin(dir, file);
                fs.stat(path, function (err, stat) {
                    if (err) next(err);
                    if (stat.isDirectory()) {

                        // Recurse
                        largest(path, function (err, cand) {
                            if (err) next(err);
                            candidates.push(cand);
                            next();
                        });
                    } else {
                        candidates.push({ path: path, size: stat.size, searched: 1 });
                        next();
                    }
                });
            });
        });
    }

    // Choose the best candidate and return it.
    listCandidates(function (err, candidates) {
        if (err) callback(err);
        var result = _(candidates)
            .filter(function (cand) { return cand != null; })
            .reduce(function (best, cand) {
                if (cand) {
                    var searched = best.searched + cand.searched;
                    if (cand.size > best.size) best = cand;
                    best.searched = searched;
                }
                return best;
            });
        callback(null, result);
    });
};


module.exports = largest;
