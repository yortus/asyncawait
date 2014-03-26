var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');


var largest = function (dir) {

    // Enumerate all files and subfolders in 'dir' to get their stats.
    var files = fs.readdirSync(dir);
    var paths = _.map(files, function (file) { return path.join(dir, file); });
    var stats = _.map(paths, function (path) { return fs.statSync(path); });

    // Build up a list of possible candidates, recursing into subfolders.
    var candidates = _.map(stats, function (stat, i) {
        if (stat.isDirectory()) return largest(paths[i]); // recurse
        return { path: paths[i], size: stat.size, searched: 1 };
    });

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
}


function nodeified(dir, callback) { try { callback(null, largest(dir)); } catch (err) { callback(err); } }
module.exports = nodeified;


//TODO: remove...
nodeified(__dirname, function (err, result) {
    console.log(err || result);
});
