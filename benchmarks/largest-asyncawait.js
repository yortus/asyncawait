var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var _ = require('lodash');
var async = require('../async');
var await = require('../await');


var largest = async (function (dir) {

    // Enumerate all files and subfolders in 'dir' to get their stats.
    var files = await (fs.readdirAsync(dir));
    var paths = _.map(files, function (file) { return path.join(dir, file); });
    var stats = await (_.map(paths, function (path) { return fs.statAsync(path); }));

    // Build up a list of possible candidates, recursing into subfolders.
    var candidates = await (_.map(stats, function (stat, i) {
        if (stat.isDirectory()) return largest(paths[i]); // recurse
        return { path: paths[i], size: stat.size, searched: 1 };
    }));

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
    return result;
});


function nodeified(dir, callback) { largest(dir).nodeify(callback); }
module.exports = nodeified;
