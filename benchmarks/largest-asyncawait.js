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

    // Find the largest file, recursing into subfolders.
    var result = { path: undefined, size: 0, searched: 0 };
    await (_.map(stats, async (function (stat, i) { //NB: new async func here so we can do them in parallel but get blocking semantics inside the func
        if (stat.isDirectory()) {
            var cand = await (largest(paths[i])); // recurse
        } else {
            var cand = { path: paths[i], size: stat.size, searched: 1 };
        }
        if (cand.size > result.size) {
            result.path = cand.path;
            result.size = cand.size;
        }
        result.searched += cand.searched;
    })));
    return result;
});


function nodeified(dir, callback) { largest(dir).nodeify(callback); }
module.exports = nodeified;


//TODO: remove...
nodeified(__dirname, function (err, result) {
    console.log(err || result);
});
