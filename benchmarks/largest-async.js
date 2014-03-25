var Promise = require('bluebird');
var fs = require('fs');
var pathJoin = require('path').join;
var _ = require('lodash');
var async = require('async');


var largest = function (dir, callback) {
    async.waterfall([
        function (callback) {

            // Build up a list of possible candidates, recursing into subfolders.
            var candidates = [];
            fs.readdir(dir, function (err, files) {
                if (err) callback(err);
                async.each(files, function(file, next) {
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
                }, function (err) {
                    if (err) callback(err);
                    callback(null, candidates);
                });
            });
        },
        function (candidates, callback) {

            // Choose the best candidate and return it.
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
        }
    ], callback);
};


module.exports = largest;
